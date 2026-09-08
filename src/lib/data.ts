import "server-only";

import {
  FALLBACK_BOARD_ISSUES,
  FALLBACK_DAY_NOTES,
  FALLBACK_FAMILY_MEMBERS,
  FALLBACK_FEATURE_SUGGESTIONS,
  FALLBACK_MOVIES,
  FALLBACK_RECIPES,
  FALLBACK_RECURRING_EVENTS,
  FALLBACK_SHORT_MESSAGES,
  FALLBACK_SHOPPING_LIST,
  FALLBACK_SINGLE_EVENTS,
  FALLBACK_WISHLIST_ITEMS,
} from "@/lib/demo-data";


import type {
  BoardIssue,
  BoardIssueStatus,
  DayNote,
  Dinner,
  DinnerCategory,
  FamilyMember,
  FeatureSuggestion,
  MovieRecommendation,
  Recipe,
  RecurringEvent,
  ShortMessage,
  ShoppingList,
  ShoppingListEntry,
  SingleEvent,
  Weather,
  WishListGroup,
  WishListItem,
} from "@/lib/types";
import {
  DEFAULT_DAY_NOTE_CATEGORY,
  type DayNoteCategory,
} from "@/lib/day-note-categories";
import { DEFAULT_EVENT_CATEGORY } from "@/lib/event-categories";
import { eventParticipantLabel } from "@/lib/event-participants";
import { singleEventCategoryLabel } from "@/lib/single-event-categories";
import { osloDateKey } from "@/lib/family-feed";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import {
  BOARD_ISSUES_QUERY,
  DAY_NOTES_QUERY,
  DINNERS_QUERY,
  FAMILY_MEMBERS_QUERY,
  FEATURE_SUGGESTIONS_QUERY,
  MOVIE_RECOMMENDATIONS_QUERY,
  RECIPES_QUERY,
  RECURRING_EVENTS_QUERY,
  SHORT_MESSAGES_QUERY,
  SHOPPING_LIST_ITEMS_QUERY,
  SINGLE_EVENTS_QUERY,
  WISHLIST_ITEMS_QUERY,

} from "@/sanity/lib/queries";

type SanityFamilyMember = {
  _id: string;
  name: string;
  role: "adult" | "child";
  emoji?: string;
  accentColor?: string;
  chores?: Array<{
    _key: string;
    amount?: number;
    chore?: {
      _id: string;
      title: string;
      text?: string;
      pay?: number;
    };
  }>;
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

type SanityDinner = {
  _id: string;
  title: string;
  ingredients?: string[];
  categories?: string[];
  day?: number;
};

type SanityFeatureSuggestion = {
  _id: string;
  title: string;
  text?: string;
};

type SanityShortMessage = {
  _id: string;
  sender?: string;
  recipients?: string[];
  text: string;
  isRead?: boolean;
  _createdAt?: string;
};

type SanityBoardIssue = {
  _id: string;
  title?: string;
  text?: string;
  assigned?: string;
  status?: string;
  _createdAt?: string;
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

type SanitySingleEvent = {
  _id: string;
  title?: string;
  category?: string;
  date: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  allDay?: boolean;
  note?: string;
  participants?: string[];
  familyMember?: string;
};

type SanityDayNote = {
  _id: string;
  date: string;
  endDate?: string;
  category?: DayNoteCategory;
  text: string;
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
    chores: (member.chores || [])
      .filter((assignment) => assignment._key && assignment.chore?._id)
      .map((assignment) => ({
        key: assignment._key,
        amount: Math.max(0, Math.floor(assignment.amount || 0)),
        chore: {
          id: assignment.chore!._id,
          title: assignment.chore!.title,
          text: assignment.chore!.text,
          pay: Math.max(0, assignment.chore!.pay || 0),
        },
      })),
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

const DINNER_CATEGORY_VALUES: DinnerCategory[] = [
  "regular",
  "cozy",
  "simple",
  "trip",
];

function isDinnerCategory(value: string): value is DinnerCategory {
  return DINNER_CATEGORY_VALUES.includes(value as DinnerCategory);
}

export async function getDinners(): Promise<Dinner[]> {
  if (!isSanityConfigured) {
    return [];
  }

  const dinners = await fetchFromSanity<SanityDinner[]>(DINNERS_QUERY);
  if (!dinners) {
    return [];
  }

  return dinners.map((dinner) => ({
    id: dinner._id,
    title: dinner.title,
    ingredients: dinner.ingredients?.filter(Boolean) || [],
    categories: (dinner.categories || []).filter(isDinnerCategory),
    day:
      typeof dinner.day === "number" &&
      Number.isInteger(dinner.day) &&
      dinner.day >= 1 &&
      dinner.day <= 14
        ? dinner.day
        : undefined,
  }));
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

export async function getShortMessages(): Promise<ShortMessage[]> {
  if (!isSanityConfigured) {
    return FALLBACK_SHORT_MESSAGES;
  }

  const messages = await fetchFromSanity<SanityShortMessage[]>(SHORT_MESSAGES_QUERY);

  if (!messages) {
    return FALLBACK_SHORT_MESSAGES;
  }

  return messages.map((message) => ({
    id: message._id,
    sender: message.sender,
    recipients: message.recipients || [],
    text: message.text,
    createdAt: message._createdAt,
    isRead: Boolean(message.isRead),
  }));
}

export async function getBoardIssues(): Promise<BoardIssue[]> {
  if (!isSanityConfigured) {
    return FALLBACK_BOARD_ISSUES;
  }

  const issues = await fetchFromSanity<SanityBoardIssue[]>(BOARD_ISSUES_QUERY);

  if (!issues) {
    return FALLBACK_BOARD_ISSUES;
  }

  const validStatuses: BoardIssueStatus[] = ["todo", "inProgress", "done"];

  return issues.map((issue) => ({
    id: issue._id,
    title: issue.title,
    text: issue.text,
    assigned: issue.assigned,
    status: validStatuses.includes(issue.status as BoardIssueStatus)
      ? (issue.status as BoardIssueStatus)
      : "todo",
    createdAt: issue._createdAt,
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

export async function getSingleEvents(): Promise<SingleEvent[]> {
  if (!isSanityConfigured) {
    return FALLBACK_SINGLE_EVENTS;
  }

  const events = await fetchFromSanity<SanitySingleEvent[]>(SINGLE_EVENTS_QUERY);

  if (!events) {
    return FALLBACK_SINGLE_EVENTS;
  }

  return events.map((event) => {
    const participants =
      event.participants?.filter(
        (participant): participant is string =>
          typeof participant === "string" && Boolean(participant.trim()),
      ) || [];

    return {
      id: event._id,
      title:
        event.title ||
        (event.category
          ? singleEventCategoryLabel(event.category)
          : "Hendelse"),
      category: event.category,
      date: event.date,
      endDate: event.endDate || event.date,
      time: event.time,
      endTime: event.endTime,
      allDay: Boolean(event.allDay),
      note: event.note,
      participants:
        participants.length > 0
          ? participants
          : event.familyMember
            ? [event.familyMember]
            : [],
      familyMember:
        participants.length > 0
          ? participants.map(eventParticipantLabel).join(", ")
          : event.familyMember || "Ukjent",
    };
  });
}

export async function getDayNotes(): Promise<DayNote[]> {
  if (!isSanityConfigured) {
    return FALLBACK_DAY_NOTES;
  }

  const notes = await fetchFromSanity<SanityDayNote[]>(DAY_NOTES_QUERY);

  if (!notes) {
    return FALLBACK_DAY_NOTES;
  }

  return notes.map((note) => ({
    id: note._id,
    date: note.date,
    endDate: note.endDate || note.date,
    category: note.category || DEFAULT_DAY_NOTE_CATEGORY,
    text: note.text,
  }));
}

// Kløfta, Ullensaker. Coordinates truncated to 4 decimals per MET guidance.
const WEATHER_LOCATION = { lat: 60.0725, lon: 11.1467 };

type MetForecast = {
  properties?: {
    timeseries?: Array<{
      time: string;
      data: {
        instant: { details: { air_temperature: number } };
        next_1_hours?: { summary: { symbol_code: string } };
        next_6_hours?: { summary: { symbol_code: string } };
      };
    }>;
  };
};

// Today's forecast from MET Norway (Yr). No API key needed, but their terms
// require an identifying User-Agent. Cached for 30 minutes. Returns null on
// any failure so the dashboard can fall back to a placeholder.
export async function getWeather(): Promise<Weather | null> {
  try {
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${WEATHER_LOCATION.lat}&lon=${WEATHER_LOCATION.lon}`,
      {
        headers: {
          "User-Agent": "family-hub/1.0 (https://github.com/sarahsvedenborg/home-assistant)",
        },
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MetForecast;
    const series = data.properties?.timeseries ?? [];

    if (series.length === 0) {
      return null;
    }

    const current = series[0];
    const temperature = current.data.instant.details.air_temperature;
    const symbolCode =
      current.data.next_1_hours?.summary.symbol_code ??
      current.data.next_6_hours?.summary.symbol_code ??
      "";

    // High/low across the forecast points that fall on today (Oslo local).
    const todayKey = osloDateKey(new Date());
    const todaysTemps = series
      .filter((entry) => osloDateKey(new Date(entry.time)) === todayKey)
      .map((entry) => entry.data.instant.details.air_temperature);
    const temps = todaysTemps.length > 0 ? todaysTemps : [temperature];

    return {
      temperature: Math.round(temperature),
      symbolCode,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
    };
  } catch {
    return null;
  }
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
