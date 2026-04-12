import "server-only";

import {
  FALLBACK_FAMILY_MEMBERS,
  FALLBACK_MOVIES,
  FALLBACK_RECIPES,
  FALLBACK_SHOPPING_LIST,
  FALLBACK_WISHLIST_ITEMS,
} from "@/lib/demo-data";


import type {
  FamilyMember,
  MovieRecommendation,
  Recipe,
  ShoppingList,
  ShoppingListEntry,
  WishListGroup,
  WishListItem,
} from "@/lib/types";
import { isSanityConfigured } from "@/sanity/env";
import { getFreshReadClient, getReadClient } from "@/sanity/lib/client";
import {
  FAMILY_MEMBERS_QUERY,
  MOVIE_RECOMMENDATIONS_QUERY,
  RECIPES_QUERY,
  SHOPPING_LIST_QUERY,
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

type SanityShoppingListItem = {
  _key: string;
  title: string;
  quantity?: string;
  note?: string;
  addedBy?: string;
  checked?: boolean;
};

type SanityShoppingList = {
  _id: string;
  title?: string;
  items?: SanityShoppingListItem[];
};

type SanityBlockChild = {
  text?: string;
};

type SanityBlock = {
  _type?: string;
  children?: SanityBlockChild[];
};

type SanityRecipe = {
  _id: string;
  title: string;
  url: string;
  content?: SanityBlock[];
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

async function fetchFreshFromSanity<T>(query: string) {
  const client = getFreshReadClient();

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

export async function getShoppingList(): Promise<ShoppingList> {
  if (!isSanityConfigured) {
    return FALLBACK_SHOPPING_LIST;
  }

  const list = await fetchFreshFromSanity<SanityShoppingList>(SHOPPING_LIST_QUERY);

  if (!list) {
    return FALLBACK_SHOPPING_LIST;
  }

  const items: ShoppingListEntry[] = (list.items || []).map((item) => ({
    id: item._key,
    title: item.title,
    quantity: item.quantity,
    note: item.note,
    addedBy: item.addedBy,
    checked: Boolean(item.checked),
  }));

  return {
    id: list._id,
    title: list.title || "Handleliste",
    items,
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  if (!isSanityConfigured) {
    return FALLBACK_RECIPES;
  }

  const recipes = await fetchFreshFromSanity<SanityRecipe[]>(RECIPES_QUERY);

  if (!recipes) {
    return FALLBACK_RECIPES;
  }

  return recipes.map((recipe) => ({
    id: recipe._id,
    title: recipe.title,
    url: recipe.url,
    content: (recipe.content || [])
      .filter((block) => block._type === "block")
      .map((block) => (block.children || []).map((child) => child.text || "").join(""))
      .filter(Boolean),
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
