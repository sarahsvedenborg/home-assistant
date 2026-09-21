import "server-only";

import { boktyvenAccessToken } from "@/sanity/env";
import type { BookSearchHit, BookSource } from "@/lib/types";

const USER_AGENT = "FamilyHub/1.0 (book lookup)";
const WORK_LIMIT = 6;
const EDITION_LIMIT = 20;
const PUBLISHER_EXPAND_LIMIT = 6;
const FETCH_TIMEOUT_MS = 8000;
const JUNK_PUBLISHER =
  /createspace|independently published|indypublish|lulu|kindle direct|print on demand/i;
const EDITION_HOUSES = [
  { match: /oxford/, name: "Oxford" },
  { match: /penguin/, name: "Penguin" },
  { match: /vintage/, name: "Vintage" },
  { match: /norton/, name: "Norton" },
  { match: /everyman/, name: "Everyman" },
  { match: /folio/, name: "Folio Society" },
  { match: /modern library/, name: "Modern Library" },
  { match: /wordsworth/, name: "Wordsworth" },
  { match: /gyldendal/, name: "Gyldendal" },
  { match: /aschehoug/, name: "Aschehoug" },
  { match: /cappelen/, name: "Cappelen" },
  { match: /oktober/, name: "Oktober" },
  { match: /samlaget/, name: "Samlaget" },
  { match: /knopf/, name: "Knopf" },
  { match: /signet/, name: "Signet" },
  { match: /bantam/, name: "Bantam" },
  { match: /harper/, name: "Harper" },
] as const;
const OPEN_LIBRARY_FIELDS = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "isbn",
  "cover_i",
  "language",
  "publisher",
  "edition_count",
  "number_of_pages_median",
  "editions",
  "editions.key",
  "editions.title",
  "editions.isbn",
  "editions.cover_i",
  "editions.number_of_pages",
  "editions.language",
  "editions.publish_year",
  "editions.publisher",
].join(",");

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

function firstCoverId(value: unknown) {
  for (const item of asList(value)) {
    const id = asNumber(item);
    if (typeof id === "number" && id > 0) {
      return Math.trunc(id);
    }
  }

  return undefined;
}

function openLibraryCoverUrl(coverId?: number, size: "M" | "L" = "M") {
  if (typeof coverId !== "number" || !Number.isFinite(coverId) || coverId <= 0) {
    return undefined;
  }

  return `https://covers.openlibrary.org/b/id/${Math.trunc(coverId)}-${size}.jpg?default=false`;
}

function openLibraryCoverFallback(olid?: string, isbn?: string) {
  if (olid && /^OL[A-Za-z0-9]+$/.test(olid)) {
    return `https://covers.openlibrary.org/b/olid/${olid}-L.jpg?default=false`;
  }

  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg?default=false`;
  }

  return undefined;
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
    publisher: asString(record.publisher) || undefined,
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
      .slice(0, EDITION_LIMIT);
  } catch {
    return [];
  }
}

function editionPublisher(edition?: Record<string, unknown> | null) {
  return asString(asList(edition?.publisher)[0]) || asString(edition?.publisher) || undefined;
}

function pickPublishers(work: Record<string, unknown>, query: string) {
  const queryText = query.toLowerCase();
  const names = asList(work.publisher)
    .map((value) => asString(value))
    .filter((name) => name && !JUNK_PUBLISHER.test(name));
  const unique: string[] = [];

  function addPublisher(name: string) {
    const exists = unique.some((item) => item.toLowerCase() === name.toLowerCase());
    if (!exists) {
      unique.push(name);
    }
  }

  if ((asNumber(work.edition_count) ?? 0) >= 10) {
    for (const house of EDITION_HOUSES.slice(0, 6)) {
      addPublisher(house.name);
    }
  }

  for (const house of EDITION_HOUSES) {
    if (
      queryText.includes(house.name.toLowerCase()) ||
      names.some((name) => house.match.test(name))
    ) {
      addPublisher(house.name);
    }
  }

  return unique.slice(0, PUBLISHER_EXPAND_LIMIT);
}

function mapOpenLibraryEdition(
  work: Record<string, unknown>,
  edition?: Record<string, unknown> | null,
): BookCandidate | null {
  const title = asString(edition?.title) || asString(work.title);
  const authors = Array.isArray(work.author_name)
    ? work.author_name.map(asString).filter(Boolean)
    : [];
  const author = authors.join(", ");
  const isbn = preferIsbn([
    ...asList(edition?.isbn).map(asString),
    ...(!edition ? asList(work.isbn).map(asString) : []),
  ]);
  const editionId = olidFromKey(asString(edition?.key));
  const workId = olidFromKey(asString(work.key));
  const coverId = firstCoverId([edition?.cover_i, work.cover_i]);
  const language = asString(asList(edition?.language)[0]) || asString(asList(work.language)[0]);
  const publisher = editionPublisher(edition);

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
    pageCount: asNumber(edition?.number_of_pages) ?? asNumber(work.number_of_pages_median),
    publicationYear:
      yearFromValue(asList(edition?.publish_year)[0]) ?? yearFromValue(work.first_publish_year),
    originalLanguage: languageLabel(language),
    publisher,
  };
}

function firstMappedEdition(value: unknown) {
  const work = asRecord(value);
  if (!work) {
    return null;
  }

  return mapOpenLibraryEdition(work, asRecord(asList(asRecord(work.editions)?.docs)[0]));
}

function addUniqueEdition(hits: BookCandidate[], seen: Set<string>, hit: BookCandidate | null) {
  if (!hit) {
    return;
  }

  const key = hit.isbn || `${hit.source}:${hit.id}`;
  if (seen.has(key) || seen.has(`${hit.source}:${hit.id}`)) {
    return;
  }

  seen.add(key);
  seen.add(`${hit.source}:${hit.id}`);
  hits.push(hit);
}

async function searchOpenLibraryDocs(params: Record<string, string>) {
  const url = new URL("https://openlibrary.org/search.json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("fields", OPEN_LIBRARY_FIELDS);

  const payload = asRecord(await fetchJson(url.toString()));
  return asList(payload?.docs);
}

async function searchOpenLibrary(query: string): Promise<BookCandidate[]> {
  try {
    const isbnQuery = preferIsbn([query]);
    const docs = isbnQuery
      ? await searchOpenLibraryDocs({ isbn: isbnQuery, limit: "3" })
      : await searchOpenLibraryDocs({ q: query, limit: String(WORK_LIMIT) });

    const hits: BookCandidate[] = [];
    const seen = new Set<string>();
    const [primary, ...others] = docs
      .map((value) => asRecord(value))
      .filter((work): work is Record<string, unknown> => Boolean(work));

    addUniqueEdition(hits, seen, primary ? firstMappedEdition(primary) : null);

    if (primary && !isbnQuery && (asNumber(primary.edition_count) ?? 0) > 1) {
      const extras = await Promise.all(
        pickPublishers(primary, query).map(async (publisher) => {
          try {
            const publisherDocs = await searchOpenLibraryDocs({
              q: query,
              publisher,
              limit: "1",
            });
            return firstMappedEdition(publisherDocs[0]);
          } catch {
            return null;
          }
        }),
      );

      for (const extra of extras) {
        addUniqueEdition(hits, seen, extra);
      }
    }

    for (const work of others) {
      addUniqueEdition(hits, seen, firstMappedEdition(work));
    }

    return hits.slice(0, EDITION_LIMIT);
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
    publisher: hit.publisher,
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
    let coverId = firstCoverId(payload.covers);

    if (!coverId) {
      const workKey = asString(asRecord(asList(payload.works)[0])?.key);
      if (workKey) {
        try {
          const path = workKey.startsWith("/") ? workKey : `/works/${workKey}`;
          const work = asRecord(await fetchJson(`https://openlibrary.org${path}.json`));
          coverId = firstCoverId(work?.covers);
        } catch {
          coverId = undefined;
        }
      }
    }

    if (!title || !author) {
      return null;
    }

    const resolvedId = olidFromKey(asString(payload.key)) || olid || isbnValue || title;

    return {
      source: "openlibrary",
      id: resolvedId,
      title: title.slice(0, 200),
      author: author.slice(0, 160),
      coverUrl:
        openLibraryCoverUrl(coverId, "L") || openLibraryCoverFallback(resolvedId, isbnValue),
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
