import "server-only";

import { FALLBACK_FAMILY_MEMBERS, FALLBACK_MOVIES, FALLBACK_WISHLIST_ITEMS } from "@/lib/demo-data";
import type {
  FamilyMember,
  MovieRecommendation,
  WishListGroup,
  WishListItem,
} from "@/lib/types";
import { isSanityConfigured } from "@/sanity/env";
import { getReadClient } from "@/sanity/lib/client";
import {
  FAMILY_MEMBERS_QUERY,
  MOVIE_RECOMMENDATIONS_QUERY,
  WISHLIST_ITEMS_QUERY,
} from "@/sanity/lib/queries";

type SanityFamilyMember = {
  _id: string;
  name: string;
  role: "adult" | "child";
  emoji?: string;
  accentColor?: string;
};

type SanityWishListItem = {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  submittedBy?: string;
};

type SanityMovieRecommendation = {
  _id: string;
  title: string;
  posterUrl?: string;
  link?: string;
  suggestedBy?: string;
  watched?: boolean;
};

async function fetchFromSanity<T>(query: string) {
  const client = getReadClient();

  if (!client) {
    return null;
  }

  try {
    return await client.fetch<T>(query);
  } catch {
    return null;
  }
}

export function getSiteMode() {
  return isSanityConfigured ? "live" : "demo";
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  if (!isSanityConfigured) {
    return FALLBACK_FAMILY_MEMBERS;
  }

  const members = await fetchFromSanity<SanityFamilyMember[]>(FAMILY_MEMBERS_QUERY);

  if (!members || members.length === 0) {
    return FALLBACK_FAMILY_MEMBERS;
  }

  return members.map((member) => ({
    id: member._id,
    name: member.name,
    role: member.role,
    emoji: member.emoji,
    accentColor: member.accentColor,
  }));
}

export async function getWishListItems(): Promise<WishListItem[]> {
  if (!isSanityConfigured) {
    return FALLBACK_WISHLIST_ITEMS;
  }

  const items = await fetchFromSanity<SanityWishListItem[]>(WISHLIST_ITEMS_QUERY);

  if (!items) {
    return FALLBACK_WISHLIST_ITEMS;
  }

  return items.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description,
    link: item.link,
    submittedBy: item.submittedBy || "Someone",
  }));
}

export async function getMovieRecommendations(): Promise<MovieRecommendation[]> {
  if (!isSanityConfigured) {
    return FALLBACK_MOVIES;
  }

  const movies = await fetchFromSanity<SanityMovieRecommendation[]>(
    MOVIE_RECOMMENDATIONS_QUERY,
  );

  if (!movies) {
    return FALLBACK_MOVIES;
  }

  return movies.map((movie) => ({
    id: movie._id,
    title: movie.title,
    posterUrl: movie.posterUrl,
    link: movie.link,
    suggestedBy: movie.suggestedBy || "Someone",
    watched: Boolean(movie.watched),
  }));
}

export function groupWishListByPerson(items: WishListItem[]): WishListGroup[] {
  const grouped = items.reduce<Record<string, WishListItem[]>>((accumulator, item) => {
    if (!accumulator[item.submittedBy]) {
      accumulator[item.submittedBy] = [];
    }

    accumulator[item.submittedBy].push(item);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([person, personItems]) => ({
      person,
      items: personItems,
    }));
}
