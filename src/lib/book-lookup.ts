import "server-only";

import { boktyvenAccessToken } from "@/sanity/env";
import type { BookSearchHit, BookSource } from "@/lib/types";

const USER_AGENT = "FamilyHub/1.0 (book lookup)";
const SEARCH_LIMIT = 8;
const FETCH_TIMEOUT_MS = 8000;

export type BookCandidate = BookSearchHit & {
  isbn?: string;
  pageCount?: number;
  originalLanguage?: string;
  authorCountry?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  nor: "Norsk",
  nob: "Norsk",
  nno: "Nynorsk",
  eng: "Engelsk",
  ger: "Tysk",
  deu: "Tysk",
  swe: "Svensk",
  dan: "Dansk",
  fre: "Fransk",
  fra: "Fransk",
  spa: "Spansk",
  ita: "Italiensk",
  dut: "Nederlandsk",
  nld: "Nederlandsk",
};

export function isBookSource(value: string): value is BookSource {
  return value === "boktyven" || value === "openlibrary";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  for (const key of ["data", "results", "books", "items"]) {
    const nested = record[key];
    if (Array.isArray(nested)) {
      return nested;
    }

    const nestedRecord = asRecord(nested);
    if (nestedRecord) {
      for (const inner of ["data", "results", "books", "items"]) {
        if (Array.isArray(nestedRecord[inner])) {
          return nestedRecord[inner] as unknown[];
        }
      }
    }
  }

  return [];
}

function digitsOnly(value: string) {
  return value.replace(/[^\dXx]/g, "").toUpperCase();
}

function preferIsbn(values: string[]) {
  const normalized = values
    .map(digitsOnly)
    .filter((value) => /^\d{10}(\d{3})?$/.test(value) || /^\d{9}X$/.test(value));
  return normalized.find((value) => value.length === 13) || normalized[0];
}

function languageLabel(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const code = trimmed.replace(/^\/languages\//, "").toLowerCase();
  return LANGUAGE_LABELS[code] || trimmed;
}

function yearFromValue(value: unknown) {
  const numeric = asNumber(value);
  if (numeric && numeric >= 1000 && numeric <= new Date().getFullYear() + 1) {
    return Math.trunc(numeric);
  }

  const text = asString(value);
  const match = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function openLibraryCoverUrl(coverId?: number, size: "M" | "L" = "M") {
  if (typeof coverId !== "number" || !Number.isFinite(coverId)) {
    return undefined;
  }

  return `https://covers.openlibrary.org/b/id/${Math.trunc(coverId)}-${size}.jpg`;
}

function olidFromKey(key?: string) {
  const value = asString(key);
  const match = value.match(/\/(?:books|works|authors)\/(OL[A-Za-z0-9]+)/);
  return match?.[1] || (value.startsWith("OL") ? value : "");
}

async function fetchJson(url: string, headers?: HeadersInit) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      ...headers,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Lookup failed (${response.status})`);
  }

  return response.json() as Promise<unknown>;
}

function mapBoktyvenBook(value: unknown): BookCandidate | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const title = asString(record.title) || asString(record.name);
  const author = asString(record.author) || asString(record.authors);
  const isbn = preferIsbn([asString(record.isbn), asString(record.isbn13), asString(record.isbn10)].filter(Boolean));

  if (!title || !author) {
    return null;
  }

  return {
    source: "boktyven",
    id: isbn || asString(record.url) || title,
    title: title.slice(0, 200),
    author: author.slice(0, 160),
    coverUrl: asString(record.coverUrl) || asString(record.cover) || undefined,
    isbn,
    pageCount: asNumber(record.pageCount) || asNumber(record.pages) || asNumber(record.numberOfPages),
    publicationYear: yearFromValue(record.publicationYear ?? record.year),
    originalLanguage: languageLabel(asString(record.language) || asString(record.originalLanguage)),
    authorCountry: asString(record.authorCountry) || asString(record.country) || undefined,
  };
}

async function searchBoktyven(query: string): Promise<BookCandidate[]> {
  if (!boktyvenAccessToken) {
    return [];
  }

  const url = new URL("https://boktyven.no/api/v1/books/search");
  url.searchParams.set("q", query);

  try {
    const payload = await fetchJson(url.toString(), {
      "X-Access-Token": boktyvenAccessToken,
    });
    return asList(payload)
      .map(mapBoktyvenBook)
      .filter((book): book is BookCandidate => Boolean(book))
      .slice(0, SEARCH_LIMIT);
  } catch {
    return [];
  }
}

function mapOpenLibrarySearchDoc(value: unknown): BookCandidate | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const editions = asRecord(record.editions);
  const edition = asRecord(asList(editions?.docs)[0]);
  const title = asString(edition?.title) || asString(record.title);
  const authors = Array.isArray(record.author_name)
    ? record.author_name.map(asString).filter(Boolean)
    : [];
  const author = authors.join(", ");
  const isbn = preferIsbn([
    ...asList(edition?.isbn).map(asString),
    ...asList(record.isbn).map(asString),
  ]);
  const editionId = olidFromKey(asString(edition?.key));
  const workId = olidFromKey(asString(record.key));
  const coverId = asNumber(edition?.cover_i) ?? asNumber(record.cover_i);
  const language = asString(asList(edition?.language)[0]) || asString(asList(record.language)[0]);

  if (!title || !author || !(editionId || workId || isbn)) {
    return null;
  }

  return {
    source: "openlibrary",
    id: editionId || workId || isbn || title,
    title: title.slice(0, 200),
    author: author.slice(0, 160),
    coverUrl: openLibraryCoverUrl(coverId),
    isbn,
    pageCount: asNumber(edition?.number_of_pages) ?? asNumber(record.number_of_pages_median),
    publicationYear:
      yearFromValue(asList(edition?.publish_year)[0]) ?? yearFromValue(record.first_publish_year),
    originalLanguage: languageLabel(language),
  };
}

async function searchOpenLibrary(query: string): Promise<BookCandidate[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("title", query);
  url.searchParams.set("limit", String(SEARCH_LIMIT));
  url.searchParams.set(
    "fields",
    [
      "key",
      "title",
      "author_name",
      "first_publish_year",
      "isbn",
      "cover_i",
      "language",
      "number_of_pages_median",
      "editions",
      "editions.key",
      "editions.title",
      "editions.isbn",
      "editions.cover_i",
      "editions.number_of_pages",
      "editions.language",
      "editions.publish_year",
    ].join(","),
  );

  try {
    const payload = await fetchJson(url.toString());
    const record = asRecord(payload);
    return asList(record?.docs)
      .map(mapOpenLibrarySearchDoc)
      .filter((book): book is BookCandidate => Boolean(book))
      .slice(0, SEARCH_LIMIT);
  } catch {
    return [];
  }
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const norwegianHits = await searchBoktyven(query);
  const hits = norwegianHits.length > 0 ? norwegianHits : await searchOpenLibrary(query);

  return hits.map((hit) => ({
    source: hit.source,
    id: hit.id,
    title: hit.title,
    author: hit.author,
    coverUrl: hit.coverUrl,
    publicationYear: hit.publicationYear,
  }));
}

async function lookupBoktyven(id: string): Promise<BookCandidate | null> {
  const matches = await searchBoktyven(id);
  const needle = digitsOnly(id);
  return (
    matches.find((book) => book.isbn && digitsOnly(book.isbn) === needle) ||
    matches.find((book) => book.id === id) ||
    matches[0] ||
    null
  );
}

async function lookupOpenLibraryAuthor(authorKey: string) {
  const olid = olidFromKey(authorKey) || authorKey;
  if (!olid) {
    return { name: "", country: undefined as string | undefined };
  }

  try {
    const payload = asRecord(await fetchJson(`https://openlibrary.org/authors/${olid}.json`));
    return {
      name: asString(payload?.name) || asString(payload?.personal_name),
      country: asString(payload?.location) || asString(payload?.birth_place) || undefined,
    };
  } catch {
    return { name: "", country: undefined as string | undefined };
  }
}

function authorKeyFromPayload(payload: Record<string, unknown>) {
  const authorRef = asRecord(asList(payload.authors)[0]);
  return asString(authorRef?.key) || asString(asRecord(authorRef?.author)?.key);
}

async function resolveOpenLibraryAuthor(payload: Record<string, unknown>) {
  const directKey = authorKeyFromPayload(payload);
  if (directKey) {
    return lookupOpenLibraryAuthor(directKey);
  }

  const workKey = asString(asRecord(asList(payload.works)[0])?.key);
  if (!workKey) {
    return { name: "", country: undefined as string | undefined };
  }

  try {
    const path = workKey.startsWith("/") ? workKey : `/works/${workKey}`;
    const work = asRecord(await fetchJson(`https://openlibrary.org${path}.json`));
    const nestedKey = work ? authorKeyFromPayload(work) : "";
    if (nestedKey) {
      return lookupOpenLibraryAuthor(nestedKey);
    }
  } catch {
    return { name: "", country: undefined as string | undefined };
  }

  return { name: "", country: undefined as string | undefined };
}

async function lookupOpenLibrary(id: string): Promise<BookCandidate | null> {
  const olid = olidFromKey(id) || id;
  const isbn = preferIsbn([id]);

  try {
    const url = olid.endsWith("W")
      ? `https://openlibrary.org/works/${olid}.json`
      : olid.startsWith("OL")
        ? `https://openlibrary.org/books/${olid}.json`
        : isbn
          ? `https://openlibrary.org/isbn/${isbn}.json`
          : "";

    if (!url) {
      return null;
    }

    const payload = asRecord(await fetchJson(url));
    if (!payload) {
      return null;
    }

    const authorInfo = await resolveOpenLibraryAuthor(payload);
    const title = asString(payload.title);
    const author =
      asString(payload.by_statement).replace(/\.$/, "") || authorInfo.name;
    const isbnValue = preferIsbn([
      ...asList(payload.isbn_13).map(asString),
      ...asList(payload.isbn_10).map(asString),
    ]);
    const languageKey = asString(asRecord(asList(payload.languages)[0])?.key);
    const coverId = asNumber(asList(payload.covers)[0]);

    if (!title || !author) {
      return null;
    }

    return {
      source: "openlibrary",
      id: olidFromKey(asString(payload.key)) || olid || isbnValue || title,
      title: title.slice(0, 200),
      author: author.slice(0, 160),
      coverUrl: openLibraryCoverUrl(coverId, "L"),
      isbn: isbnValue,
      pageCount: asNumber(payload.number_of_pages),
      publicationYear: yearFromValue(payload.publish_date),
      originalLanguage: languageLabel(languageKey),
      authorCountry: authorInfo.country,
    };
  } catch {
    return null;
  }
}

export async function lookupBook(source: BookSource, id: string) {
  if (source === "boktyven") {
    return lookupBoktyven(id);
  }

  return lookupOpenLibrary(id);
}

export function isAllowedCoverUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }

    const host = url.hostname.toLowerCase();
    return (
      host === "covers.openlibrary.org" ||
      host === "boktyven.no" ||
      host.endsWith(".boktyven.no")
    );
  } catch {
    return false;
  }
}
