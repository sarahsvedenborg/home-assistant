import "server-only";

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
  suitableFor: string[];
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
    suitableFor: string[];
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
  addedBy?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  await client.create({
    _type: "shoppingListItem",
    title: input.title,
    quantity: input.quantity,
    note: input.note,
    addedBy: input.addedBy,
    checked: false,
  });

  return "Varen er lagt til i handlelisten!";
}

export async function toggleShoppingListItem(itemId: string) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const currentItem = await client.fetch<{ _id: string; checked?: boolean } | null>(
    `*[_type == "shoppingListItem" && _id == $id][0]{_id, checked}`,
    { id: itemId },
  );

  if (!currentItem?._id) {
    throw new Error("Fant ikke varen du ville oppdatere.");
  }

  const nextChecked = !Boolean(currentItem.checked);

  await client.patch(currentItem._id).set({ checked: nextChecked }).commit();

  return nextChecked;
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

export async function submitSingleEvent(input: {
  title: string;
  familyMemberName: string;
  category: string;
  date: string;
  allDay: boolean;
  time?: string;
  endTime?: string;
  note?: string;
}) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const familyMember = await resolveFamilyMemberReference(input.familyMemberName);
  const document: {
    _type: "singleEvent";
    title: string;
    familyMemberName: string;
    category: string;
    date: string;
    allDay: boolean;
    time?: string;
    endTime?: string;
    note?: string;
    familyMember?: { _type: "reference"; _ref: string };
    status: "pending" | "approved";
  } = {
    _type: "singleEvent",
    title: input.title,
    familyMemberName: input.familyMemberName,
    category: input.category,
    date: input.date,
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
