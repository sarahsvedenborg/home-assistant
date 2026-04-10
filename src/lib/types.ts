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
