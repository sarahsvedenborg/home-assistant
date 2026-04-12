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
};

export type MovieRecommendation = {
  id: string;
  title: string;
  posterUrl?: string;
  link?: string;
  suggestedBy: string;
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
};

export type ShoppingList = {
  id: string;
  title: string;
  items: ShoppingListEntry[];
};

export type Recipe = {
  id: string;
  title: string;
  url: string;
  ingredients: string[];
  steps: string[];
  comments: string[];
};
