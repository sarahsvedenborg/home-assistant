import "server-only";

import { randomUUID } from "crypto";

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
    ? "Thanks! A grown-up can approve this in the studio."
    : "Added to the family wish list!";
}

export async function submitMovieRecommendation(input: {
  title: string;
  link?: string;
  posterUrl?: string;
  suggestedByName: string;
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
    suggestedByName: string;
    familyMember?: { _type: "reference"; _ref: string };
    watched: boolean;
    status: "pending" | "approved";
  } = {
    _type: "movieRecommendation",
    title: input.title,
    link: input.link,
    posterUrl: input.posterUrl,
    suggestedByName: input.suggestedByName,
    watched: false,
    status: requireApproval ? "pending" : "approved",
  };

  if (familyMember) {
    document.familyMember = familyMember;
  }

  await client.create(document);

  return requireApproval
    ? "Movie suggestion sent! A grown-up can approve it in the studio."
    : "Movie night idea added!";
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

  const existingList = await client.fetch<{ _id: string } | null>(
    `*[_type == "shoppingList"][0]{_id}`,
  );

  const item = {
    _key: randomUUID(),
    title: input.title,
    quantity: input.quantity,
    note: input.note,
    addedBy: input.addedBy,
    checked: false,
  };

  if (!existingList?._id) {
    await client.create({
      _type: "shoppingList",
      title: "Handleliste",
      items: [item],
    });
  } else {
    await client
      .patch(existingList._id)
      .setIfMissing({ items: [] })
      .append("items", [item])
      .commit();
  }

  return "Varen er lagt til i handlelisten!";
}

export async function toggleShoppingListItem(itemId: string) {
  const client = getWriteClient();

  if (!client) {
    throw new Error("Sanity writes are not configured yet.");
  }

  const existingList = await client.fetch<{
    _id: string;
    items?: Array<{ _key: string; checked?: boolean }>;
  } | null>(`*[_type == "shoppingList"][0]{_id, items[]{_key, checked}}`);

  if (!existingList?._id) {
    throw new Error("Handlelisten finnes ikke ennå.");
  }

  const currentItem = existingList.items?.find((item) => item._key === itemId);

  if (!currentItem) {
    throw new Error("Fant ikke varen du ville oppdatere.");
  }

  await client
    .patch(existingList._id)
    .set({ [`items[_key==\"${itemId}\"].checked`]: !Boolean(currentItem.checked) })
    .commit();

  return !Boolean(currentItem.checked);
}

export async function submitRecipe(input: {
  title: string;
  url: string;
  ingredients: string;
  steps: string;
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
    ingredients: input.ingredients.split(/\n+/).filter(Boolean).map((text) => ({
      _type: "block",
      children: [{ _type: "span", marks: [], text }],
      markDefs: [],
      style: "normal",
    })),
    steps: input.steps.split(/\n+/).filter(Boolean).map((text) => ({
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
