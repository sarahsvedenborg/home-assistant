export type FamilyRole = "adult" | "child";

export type FamilyMember = {
  id: string;
  name: string;
  role: FamilyRole;
  emoji?: string;
  accentColor?: string;
};

export type WishListItem = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  submittedBy: string;
  createdAt?: string;
};

export type MovieRecommendation = {
  id: string;
  title: string;
  posterUrl?: string;
  link?: string;
  suggestedBy: string;
  suitableFor: string[];
  watched: boolean;
};

export type WishListGroup = {
  person: string;
  items: WishListItem[];
};

export type FamilyMemberWishListGroup = {
  member: FamilyMember;
  items: WishListItem[];
};

export type ShoppingListEntry = {
  id: string;
  title: string;
  quantity?: string;
  note?: string;
  addedBy?: string;
  checked: boolean;
  createdAt?: string;
};

export type ShoppingList = {
  id: string;
  title: string;
  items: ShoppingListEntry[];
};

export type Recipe = {
  id: string;
  title: string;
  url?: string;
  ingredients: string[];
  steps: string[];
  comments: string[];
};

export type FeatureSuggestion = {
  id: string;
  title: string;
  text?: string;
};

export type SingleEvent = {
  id: string;
  title: string;
  category: string;
  date: string; // ISO datetime; only the date portion is significant
  time?: string;
  endTime?: string;
  allDay?: boolean;
  note?: string;
  familyMember: string;
};

export type Weather = {
  temperature: number; // current air temperature, °C
  symbolCode: string; // MET Norway symbol code, e.g. "partlycloudy_day"
  high: number; // today's highest forecast temperature, °C
  low: number; // today's lowest forecast temperature, °C
};

export type RecurringEvent = {
  id: string;
  title: string;
  category: string;
  dayOfWeek: string;
  time?: string;
  endTime?: string;
  whatToBring?: string;
  startDate?: string;
  endDate?: string;
  familyMember: string;
};
