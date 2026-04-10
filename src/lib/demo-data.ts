import type { FamilyMember, MovieRecommendation, WishListItem } from "@/lib/types";

export const FALLBACK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: "mom", name: "Mamma", role: "adult", emoji: "🌻", accentColor: "#ff9f6e" },
  { id: "dad", name: "Pappa", role: "adult", emoji: "🧭", accentColor: "#4f8cff" },
  { id: "2012", name: "Amélie", role: "child", emoji: "🎨", accentColor: "#ffcc66" },
  { id: "2014", name: "Colette", role: "child", emoji: "🚀", accentColor: "#68c3a3" },
  { id: "2018", name: "Linnea", role: "child", emoji: "🦖", accentColor: "#ff7b7b" },
  { id: "2020", name: "Felix", role: "child", emoji: "🌈", accentColor: "#8f7cff" },
];

export const FALLBACK_WISHLIST_ITEMS: WishListItem[] = [
  {
    id: "wish-1",
    title: "Sketchbook with bright markers",
    description: "A jumbo pad with thick pages for doodles and sticker ideas.",
    submittedBy: "Avery",
    link: "https://example.com/sketchbook",
  },
  {
    id: "wish-2",
    title: "Build-your-own rocket kit",
    description: "Something hands-on that can be painted after it is built.",
    submittedBy: "Finn",
  },
  {
    id: "wish-3",
    title: "Glow-in-the-dark dinosaur blanket",
    description: "Soft blanket for movie nights and reading time.",
    submittedBy: "Milo",
  },
  {
    id: "wish-4",
    title: "Family waffle breakfast gift card",
    description: "A fun morning out together.",
    submittedBy: "Dad",
  },
];

export const FALLBACK_MOVIES: MovieRecommendation[] = [
  {
    id: "movie-1",
    title: "The Mitchells vs. the Machines",
    suggestedBy: "Mom",
    watched: true,
    link: "https://example.com/mitchells",
  },
  {
    id: "movie-2",
    title: "Paddington 2",
    suggestedBy: "Scout",
    watched: false,
  },
  {
    id: "movie-3",
    title: "Spider-Man: Into the Spider-Verse",
    suggestedBy: "Finn",
    watched: false,
  },
];
