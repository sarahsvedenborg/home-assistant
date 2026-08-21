import "server-only";

import {
  FALLBACK_FAMILY_MEMBERS,
  FALLBACK_FEATURE_SUGGESTIONS,
  FALLBACK_MOVIES,
  FALLBACK_RECIPES,
  FALLBACK_RECURRING_EVENTS,
  FALLBACK_SHOPPING_LIST,
  FALLBACK_WISHLIST_ITEMS,
} from "@/lib/demo-data";


import type {
  FamilyMember,
  FeatureSuggestion,
  MovieRecommendation,
  Recipe,
  RecurringEvent,
  ShoppingList,
  ShoppingListEntry,
  WishListGroup,
  WishListItem,
} from "@/lib/types";
import { DEFAULT_EVENT_CATEGORY } from "@/lib/event-categories";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FAMILY_MEMBERS_QUERY,
  FEATURE_SUGGESTIONS_QUERY,
  MOVIE_RECOMMENDATIONS_QUERY,
  RECIPES_QUERY,
  RECURRING_EVENTS_QUERY,
  SHOPPING_LIST_ITEMS_QUERY,
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
  _createdAt?: string;
};

type SanityMovieRecommendation = {
  _id: string;
  title: string;
  posterUrl?: string;
  link?: string;
  suggestedBy?: string;
  suitableFor?: string[];
  watched?: boolean;
};

type SanityShoppingListItem = {
  _id: string;
  title: string;
  quantity?: string;
  note?: string;
  addedBy?: string;
  checked?: boolean;
  _createdAt?: string;
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
  url?: string;
  ingredients?: SanityBlock[];
  steps?: SanityBlock[];
  comments?: SanityBlock[];
};

type SanityFeatureSuggestion = {
  _id: string;
  title: string;
  text?: string;
};

type SanityRecurringEvent = {
  _id: string;
  title: string;
  category?: string;
  dayOfWeek: string;
  time?: string;
  endTime?: string;
  whatToBring?: string;
  startDate?: string;
  endDate?: string;
  familyMember?: string;
};

function blocksToParagraphs(blocks?: SanityBlock[]) {
  return (blocks || [])
    .filter((block) => block._type === "block")
    .map((block) => (block.children || []).map((child) => child.text || "").join(""))
    .filter(Boolean);
}

// All reads go through the Live Content API's sanityFetch so every connected
// client (notably the always-on kiosk) updates in real time when content
// changes. It manages caching/revalidation and the live event id for us.
async function fetchFromSanity<T>(query: string): Promise<T | null> {
  if (!isSanityConfigured) {
    return null;
  }

  try {
    const { data } = await sanityFetch({ query });
    return (data as T) ?? null;
  } catch {
    return null;
  }
}

// Kept as a separate name for call-site clarity; live updates make every fetch
// current, so there is no longer a distinct "fresh" (CDN-bypassing) path.
async function fetchFreshFromSanity<T>(query: string): Promise<T | null> {
  return fetchFromSanity<T>(query);
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
    createdAt: item._createdAt,
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
    suitableFor: movie.suitableFor || [],
    watched: Boolean(movie.watched),
  }));
}

export async function getShoppingList(): Promise<ShoppingList> {
  if (!isSanityConfigured) {
    return FALLBACK_SHOPPING_LIST;
  }

  const itemDocs = await fetchFreshFromSanity<SanityShoppingListItem[]>(
    SHOPPING_LIST_ITEMS_QUERY,
  );

  if (!itemDocs) {
    return FALLBACK_SHOPPING_LIST;
  }

  const items: ShoppingListEntry[] = itemDocs.map((item) => ({
    id: item._id,
    title: item.title,
    quantity: item.quantity,
    note: item.note,
    addedBy: item.addedBy,
    checked: Boolean(item.checked),
    createdAt: item._createdAt,
  }));

  return {
    id: "shopping-list",
    title: "Handleliste",
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
    ingredients: blocksToParagraphs(recipe.ingredients),
    steps: blocksToParagraphs(recipe.steps),
    comments: blocksToParagraphs(recipe.comments),
  }));
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find((recipe) => recipe.id === id) || null;
}

export async function getFeatureSuggestions(): Promise<FeatureSuggestion[]> {
  if (!isSanityConfigured) {
    return FALLBACK_FEATURE_SUGGESTIONS;
  }

  const suggestions = await fetchFromSanity<SanityFeatureSuggestion[]>(
    FEATURE_SUGGESTIONS_QUERY,
  );

  if (!suggestions) {
    return FALLBACK_FEATURE_SUGGESTIONS;
  }

  return suggestions.map((suggestion) => ({
    id: suggestion._id,
    title: suggestion.title,
    text: suggestion.text,
  }));
}

export async function getRecurringEvents(): Promise<RecurringEvent[]> {
  if (!isSanityConfigured) {
    return FALLBACK_RECURRING_EVENTS;
  }

  const events = await fetchFromSanity<SanityRecurringEvent[]>(RECURRING_EVENTS_QUERY);

  if (!events) {
    return FALLBACK_RECURRING_EVENTS;
  }

  return events.map((event) => ({
    id: event._id,
    title: event.title,
    category: event.category || DEFAULT_EVENT_CATEGORY,
    dayOfWeek: event.dayOfWeek,
    time: event.time,
    endTime: event.endTime,
    whatToBring: event.whatToBring,
    startDate: event.startDate,
    endDate: event.endDate,
    familyMember: event.familyMember || "Ukjent",
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
