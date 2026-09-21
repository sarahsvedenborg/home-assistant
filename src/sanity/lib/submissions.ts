import "server-only";

import {
  EVENT_PARTICIPANT_ADULTS,
  EVENT_PARTICIPANT_ALL,
} from "@/lib/event-participants";
import type { DayNoteCategory } from "@/lib/day-note-categories";
import type { BoardIssueStatus, BookSource } from "@/lib/types";
import { isAllowedCoverUrl, lookupBook } from "@/lib/book-lookup";
import { requireApproval } from "@/sanity/env";
import { getReadClient, getWriteClient } from "@/sanity/lib/client";
import { FAMILY_MEMBERS_QUERY } from "@/sanity/lib/queries";

type FamilyMemberLookup = {
  _id: string;
  name: string;
};

async function resolveFamilyMemberReference(name: string) {
  const client = getReadClient();

  if (!client) {
    return undefined;
  }

  try {
    const familyMembers = await client.fetch<FamilyMemberLookup[]>(
      FAMILY_MEMBERS_QUERY,
    );

    const match = familyMembers.find(
      (member) => member.name.toLowerCase() === name.toLowerCase(),
    );

    if (!match) {
      return undefined;
    }

    return {
      _type: "reference" as const,
      _ref: match._id,
    };
  } catch {
    return undefined;
  }
}

export async function submitWishListItem(input: {
  title: string;
  description?: string;
  link?: string;
  submittedByName: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const familyMember = await resolveFamilyMemberReference(input.submittedByName);
  const document: {
    _type: "wishListItem";
    title: string;
    description?: string;
    link?: string;
    submittedByName: string;
    familyMember?: { _type: "reference"; _ref: string };
    status: "pending" | "approved";
  } = {
    _type: "wishListItem",
    title: input.title,
    description: input.description,
    link: input.link,
    submittedByName: input.submittedByName,
    status: requireApproval ? "pending" : "approved",
  };

  if (familyMember) {
    document.familyMember = familyMember;
  }

  await client.create(document);

  return requireApproval
    ? "Takk! En voksen kan godkjenne det i studioet."
    : "Lagt til i familiens ønskeliste!";
}

export async function submitMovieRecommendation(input: {
  title: string;
  link?: string;
  posterUrl?: string;
  suggestedByName: string;
  suitableFor: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const familyMember = await resolveFamilyMemberReference(input.suggestedByName);
  const document: {
    _type: "movieRecommendation";
    title: string;
    link?: string;
    posterUrl?: string;
    suitableFor: string;
    familyMember?: { _type: "reference"; _ref: string };
    watched: boolean;
    status: "pending" | "approved";
  } = {
    _type: "movieRecommendation",
    title: input.title,
    link: input.link,
    posterUrl: input.posterUrl,
    suitableFor: input.suitableFor,
    watched: false,
    status: requireApproval ? "pending" : "approved",
  };

  if (familyMember) {
    document.familyMember = familyMember;
  }

  await client.create(document);

  return requireApproval
    ? "Filmforslaget er sendt! En voksen kan godkjenne det i studioet."
    : "Filmforslaget er lagt til!";
}

export async function toggleMovieWatched(movieId: string) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const movie = await client.fetch<{ _id: string; watched?: boolean } | null>(
    `*[_type == "movieRecommendation" && _id == $movieId][0]{_id, watched}`,
    { movieId },
  );

  if (!movie?._id) {
    throw new Error("Fant ikke filmen du ville oppdatere.");
  }

  const nextWatched = !Boolean(movie.watched);

  await client.patch(movie._id).set({ watched: nextWatched }).commit();

  return nextWatched;
}

export async function addShoppingListItem(input: {
  title: string;
  quantity?: string;
  note?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const existingItems = await client.fetch<
    Array<{ _id: string; title?: string; checked?: boolean }>
  >(
    `*[_type == "shoppingListItem" && lower(title) == $title] | order(_updatedAt desc) {
      _id,
      title,
      checked
    }`,
    { title: input.title.toLowerCase() },
  );
  const matchesTitle = (item: { title?: string }) =>
    (item.title || "").trim().toLowerCase() === input.title.toLowerCase();
  const alreadyNeeded = existingItems.find(
    (item) => matchesTitle(item) && !item.checked,
  );
  const boughtItem = existingItems.find(
    (item) => matchesTitle(item) && item.checked,
  );

  if (alreadyNeeded) {
    return "Varen står allerede på listen.";
  }

  if (boughtItem) {
    const updates: { checked: false; quantity?: string; note?: string } = {
      checked: false,
    };

    if (input.quantity) {
      updates.quantity = input.quantity;
    }

    if (input.note) {
      updates.note = input.note;
    }

    await client.patch(boughtItem._id).set(updates).commit();
    return "Varen er flyttet tilbake til må kjøpes.";
  }

  await client.create({
    _type: "shoppingListItem",
    title: input.title,
    quantity: input.quantity,
    note: input.note,
    checked: false,
  });

  return "Varen er lagt til i handlelisten!";
}

export async function setShoppingListItemChecked(
  itemId: string,
  checked: boolean,
) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const currentItem = await client.fetch<{ _id: string } | null>(
    `*[_type == "shoppingListItem" && _id == $id][0]{_id}`,
    { id: itemId },
  );

  if (!currentItem?._id) {
    throw new Error("Fant ikke varen du ville oppdatere.");
  }

  await client.patch(currentItem._id).set({ checked }).commit();

  return checked;
}

const STUDIED_FLAGS_DOCUMENT_ID = "studiedFlags";

type StudiedFlagEntry = {
  _key?: string;
  code?: string;
  name?: string;
};

export async function setStudiedFlag(
  code: string,
  studied: boolean,
  name?: string,
) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const existing = await client.fetch<{ flags?: StudiedFlagEntry[] } | null>(
    `*[_id == $id][0]{ flags }`,
    { id: STUDIED_FLAGS_DOCUMENT_ID },
  );
  const currentFlags = Array.isArray(existing?.flags) ? existing.flags : [];
  const nextFlags = studied
    ? currentFlags.some((flag) => flag.code === code)
      ? currentFlags
      : [...currentFlags, { _key: code, code, name }]
    : currentFlags.filter((flag) => flag.code !== code);

  await client.createIfNotExists({
    _id: STUDIED_FLAGS_DOCUMENT_ID,
    _type: "studiedFlags",
    flags: [],
  });
  await client.patch(STUDIED_FLAGS_DOCUMENT_ID).set({ flags: nextFlags }).commit();

  return studied;
}

export async function submitRecipe(input: {
  title: string;
  url?: string;
  ingredients?: string;
  steps?: string;
  comments?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "recipe",
    title: input.title,
    url: input.url,
    ingredients: (input.ingredients || "").split(/\n+/).filter(Boolean).map((text) => ({
      _type: "block",
      children: [{ _type: "span", marks: [], text }],
      markDefs: [],
      style: "normal",
    })),
    steps: (input.steps || "").split(/\n+/).filter(Boolean).map((text) => ({
      _type: "block",
      children: [{ _type: "span", marks: [], text }],
      markDefs: [],
      style: "normal",
    })),
    comments: (input.comments || "").split(/\n+/).filter(Boolean).map((text) => ({
      _type: "block",
      children: [{ _type: "span", marks: [], text }],
      markDefs: [],
      style: "normal",
    })),
  });

  return "Oppskriften er lagt til!";
}

export async function submitFeatureSuggestion(input: {
  title: string;
  text?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "featureSuggestion",
    title: input.title,
    text: input.text,
    status: requireApproval ? "pending" : "approved",
  });

  return requireApproval
    ? "Takk for forslaget! En voksen kan godkjenne det i studioet."
    : "Takk for forslaget!";
}

export async function submitShortMessage(input: {
  sender?: string;
  recipients: string[];
  text: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "shortMessage",
    sender: input.sender,
    recipients: input.recipients,
    text: input.text,
    isRead: false,
    status: requireApproval ? "pending" : "approved",
  });

  return requireApproval
    ? "Meldingen er sendt! En voksen kan godkjenne den i studioet."
    : "Meldingen er lagt til!";
}

export async function setShortMessageReadState(
  messageId: string,
  isRead: boolean,
) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const message = await client.fetch<{ _id: string } | null>(
    `*[_type == "shortMessage" && _id == $messageId][0]{_id}`,
    { messageId },
  );

  if (!message?._id) {
    throw new Error("Fant ikke meldingen du ville markere som lest.");
  }

  await client.patch(message._id).set({ isRead }).commit();
}

export async function submitBoardIssue(input: {
  title?: string;
  text?: string;
  assigned?: string;
  status: BoardIssueStatus;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "boardIssue",
    title: input.title,
    text: input.text,
    assigned: input.assigned,
    status: input.status,
  });

  return "Oppgaven er lagt til!";
}

export async function updateBoardIssueStatus(
  issueId: string,
  status: BoardIssueStatus,
) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const issue = await client.fetch<{ _id: string } | null>(
    `*[_type == "boardIssue" && _id == $issueId][0]{_id}`,
    { issueId },
  );

  if (!issue?._id) {
    throw new Error("Fant ikke oppgaven du ville oppdatere.");
  }

  await client.patch(issue._id).set({ status }).commit();
}

export async function changeMemberChoreAmount(
  memberId: string,
  assignmentKey: string,
  delta: -1 | 1,
) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(assignmentKey)) {
    throw new Error("Oppgaven har en ugyldig nøkkel.");
  }

  const member = await client.fetch<{
    _id: string;
    assignment?: { amount?: number };
  } | null>(
    `*[_type == "familyMember" && _id == $memberId][0]{
      _id,
      "assignment": chores[_key == $assignmentKey][0]{amount}
    }`,
    { memberId, assignmentKey },
  );

  if (!member?._id || !member.assignment) {
    throw new Error("Fant ikke familieoppgaven du ville oppdatere.");
  }

  const currentAmount = Math.max(0, Math.floor(member.assignment.amount || 0));

  if (delta === -1 && currentAmount === 0) {
    return 0;
  }

  const amountPath = `chores[_key=="${assignmentKey}"].amount`;
  const patch = client.patch(member._id);

  if (typeof member.assignment.amount !== "number") {
    patch.set({ [amountPath]: 0 });
  }

  await patch.inc({ [amountPath]: delta }).commit();

  return currentAmount + delta;
}

export async function resetMemberChoreAmounts(memberId: string) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const member = await client.fetch<{
    _id: string;
    chores?: Array<{ _key?: string }>;
  } | null>(
    `*[_type == "familyMember" && _id == $memberId][0]{
      _id,
      chores[]{_key}
    }`,
    { memberId },
  );

  if (!member?._id) {
    throw new Error("Fant ikke familiemedlemmet du ville betale.");
  }

  const amountUpdates = Object.fromEntries(
    (member.chores || [])
      .map((assignment) => assignment._key)
      .filter(
        (assignmentKey): assignmentKey is string =>
          typeof assignmentKey === "string" && /^[A-Za-z0-9_-]+$/.test(assignmentKey),
      )
      .map((assignmentKey) => [`chores[_key=="${assignmentKey}"].amount`, 0]),
  );

  if (Object.keys(amountUpdates).length > 0) {
    await client.patch(member._id).set(amountUpdates).commit();
  }
}

export async function submitDayNote(input: {
  date: string;
  endDate: string;
  category: DayNoteCategory;
  text: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "dayNote",
    date: input.date,
    endDate: input.endDate,
    category: input.category,
    text: input.text,
  });

  return "Dagsnotatet er lagt til!";
}

export async function submitSingleEvent(input: {
  title?: string;
  participants: string[];
  category?: string;
  date: string;
  endDate: string;
  allDay: boolean;
  time?: string;
  endTime?: string;
  note?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const singleMemberName =
    input.participants.length === 1 &&
    input.participants[0] !== EVENT_PARTICIPANT_ALL &&
    input.participants[0] !== EVENT_PARTICIPANT_ADULTS
      ? input.participants[0]
      : undefined;
  const familyMember = singleMemberName
    ? await resolveFamilyMemberReference(singleMemberName)
    : undefined;
  const document: {
    _type: "singleEvent";
    title?: string;
    participants: string[];
    familyMemberName?: string;
    category?: string;
    date: string;
    endDate: string;
    allDay: boolean;
    time?: string;
    endTime?: string;
    note?: string;
    familyMember?: { _type: "reference"; _ref: string };
    status: "pending" | "approved";
  } = {
    _type: "singleEvent",
    title: input.title,
    participants: input.participants,
    familyMemberName: singleMemberName,
    category: input.category,
    date: input.date,
    endDate: input.endDate,
    allDay: input.allDay,
    time: input.time,
    endTime: input.endTime,
    note: input.note,
    status: requireApproval ? "pending" : "approved",
  };

  if (familyMember) {
    document.familyMember = familyMember;
  }

  await client.create(document);

  return requireApproval
    ? "Hendelsen er sendt! En voksen kan godkjenne den i studioet."
    : "Hendelsen er lagt til!";
}

export async function submitRecurringEvent(input: {
  title: string;
  familyMemberName: string;
  category: string;
  dayOfWeek: string;
  time?: string;
  endTime?: string;
  whatToBring?: string;
  startDate?: string;
  endDate?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const familyMember = await resolveFamilyMemberReference(input.familyMemberName);
  const document: {
    _type: "recurringEvent";
    title: string;
    familyMemberName: string;
    category: string;
    dayOfWeek: string;
    time?: string;
    endTime?: string;
    whatToBring?: string;
    startDate?: string;
    endDate?: string;
    familyMember?: { _type: "reference"; _ref: string };
    status: "pending" | "approved";
  } = {
    _type: "recurringEvent",
    title: input.title,
    familyMemberName: input.familyMemberName,
    category: input.category,
    dayOfWeek: input.dayOfWeek,
    time: input.time,
    endTime: input.endTime,
    whatToBring: input.whatToBring,
    startDate: input.startDate,
    endDate: input.endDate,
    status: requireApproval ? "pending" : "approved",
  };

  if (familyMember) {
    document.familyMember = familyMember;
  }

  await client.create(document);

  return requireApproval
    ? "Aktiviteten er sendt! En voksen kan godkjenne den i studioet."
    : "Aktiviteten er lagt til!";
}

const COVER_MAX_BYTES = 5_000_000;

async function uploadCoverFromUrl(
  client: NonNullable<ReturnType<typeof getWriteClient>>,
  coverUrl: string,
  filename: string,
  alt: string,
) {
  if (!isAllowedCoverUrl(coverUrl)) {
    return undefined;
  }

  try {
    const response = await fetch(coverUrl, {
      headers: { Accept: "image/*", "User-Agent": "FamilyHub/1.0 (book cover)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    if (!response.ok || !isAllowedCoverUrl(response.url)) {
      return undefined;
    }

    const contentType = (response.headers.get("content-type") || "").split(";")[0];
    if (!contentType.startsWith("image/")) {
      return undefined;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > COVER_MAX_BYTES) {
      return undefined;
    }

    const asset = await client.assets.upload("image", buffer, {
      filename,
      contentType,
    });

    return {
      _type: "image" as const,
      asset: {
        _type: "reference" as const,
        _ref: asset._id,
      },
      alt,
    };
  } catch {
    return undefined;
  }
}

export async function submitBook(input: { source: BookSource; id: string }) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const book = await lookupBook(input.source, input.id);

  if (!book) {
    throw new Error("Fant ikke boken. Søk på nytt og prøv igjen.");
  }

  if (book.isbn) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "book" && isbn == $isbn][0]{_id}`,
      { isbn: book.isbn },
    );

    if (existing?._id) {
      return "Boken er allerede i biblioteket.";
    }
  }

  const cover = book.coverUrl
    ? await uploadCoverFromUrl(
        client,
        book.coverUrl,
        `${book.isbn || book.id}.jpg`,
        `Omslag for ${book.title}`,
      )
    : undefined;

  const document: {
    _type: "book";
    title: string;
    author: string;
    isbn?: string;
    pageCount?: number;
    publicationYear?: number;
    originalLanguage?: string;
    authorCountry?: string;
    cover?: {
      _type: "image";
      asset: { _type: "reference"; _ref: string };
      alt: string;
    };
  } = {
    _type: "book",
    title: book.title,
    author: book.author,
  };

  if (book.isbn) {
    document.isbn = book.isbn;
  }

  if (typeof book.pageCount === "number" && book.pageCount >= 1) {
    document.pageCount = Math.trunc(book.pageCount);
  }

  if (typeof book.publicationYear === "number") {
    document.publicationYear = book.publicationYear;
  }

  if (book.originalLanguage) {
    document.originalLanguage = book.originalLanguage;
  }

  if (book.authorCountry) {
    document.authorCountry = book.authorCountry;
  }

  if (cover) {
    document.cover = cover;
  }

  await client.create(document);

  return `${book.title} er lagt til!`;
}
