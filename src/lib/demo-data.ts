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
    title: "Tegneblokk med sterke tusjer",
    description: "En stor blokk med tykke sider til tegninger og klistremerkeideer.",
    submittedBy: "Amelie",
    link: "https://example.com/sketchbook",
  },
  {
    id: "wish-2",
    title: "Byggesett til rakett",
    description: "Noe praktisk som kan males etter at det er bygget.",
    submittedBy: "Colette",
  },
  {
    id: "wish-3",
    title: "Selvlysende dinosaurteppe",
    description: "Et mykt teppe til filmkvelder og lesestund.",
    submittedBy: "Linnea",
  },
  {
    id: "wish-4",
    title: "Gavekort til familie-vaffelfrokost",
    description: "En hyggelig morgen ute sammen.",
    submittedBy: "Pappa",
  },
];

export const FALLBACK_MOVIES: MovieRecommendation[] = [
  {
    id: "movie-1",
    title: "The Mitchells vs. the Machines",
    suggestedBy: "Mamma",
    watched: true,
    link: "https://example.com/mitchells",
  },
  {
    id: "movie-2",
    title: "Paddington 2",
    suggestedBy: "Felix",
    watched: false,
  },
  {
    id: "movie-3",
    title: "Spider-Man: Into the Spider-Verse",
    suggestedBy: "Colette",
    watched: false,
  },
];
