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
