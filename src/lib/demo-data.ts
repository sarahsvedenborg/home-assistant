import type {
  BoardIssue,
  FamilyMember,
  FeatureSuggestion,
  MovieRecommendation,
  Recipe,
  RecurringEvent,
  ShortMessage,
  ShoppingList,
  SingleEvent,
  WishListItem,
} from "@/lib/types";

export const FALLBACK_BOARD_ISSUES: BoardIssue[] = [
  {
    id: "issue-1",
    title: "Rydde boden",
    text: "Sortere det som skal beholdes og gis bort.",
    assigned: "Pappa",
    status: "todo",
  },
  {
    id: "issue-2",
    title: "Bestille bursdagsgave",
    assigned: "Mamma",
    status: "inProgress",
  },
  {
    id: "issue-3",
    title: "Henge opp kalenderen",
    status: "done",
  },
];

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
    createdAt: "2026-08-20T18:30:00.000Z",
  },
  {
    id: "wish-2",
    title: "Byggesett til rakett",
    description: "Noe praktisk som kan males etter at det er bygget.",
    submittedBy: "Colette",
    createdAt: "2026-08-19T09:15:00.000Z",
  },
  {
    id: "wish-3",
    title: "Selvlysende dinosaurteppe",
    description: "Et mykt teppe til filmkvelder og lesestund.",
    submittedBy: "Linnea",
    createdAt: "2026-08-05T12:00:00.000Z",
  },
  {
    id: "wish-4",
    title: "Gavekort til familie-vaffelfrokost",
    description: "En hyggelig morgen ute sammen.",
    submittedBy: "Pappa",
    createdAt: "2026-08-21T07:45:00.000Z",
  },
];

export const FALLBACK_MOVIES: MovieRecommendation[] = [
  {
    id: "movie-1",
    title: "The Mitchells vs. the Machines",
    suggestedBy: "Mamma",
    suitableFor: ["Amélie", "Colette", "Linnea", "Felix"],
    watched: true,
    link: "https://example.com/mitchells",
  },
  {
    id: "movie-2",
    title: "Paddington 2",
    suggestedBy: "Felix",
    suitableFor: ["Linnea", "Felix"],
    watched: false,
  },
  {
    id: "movie-3",
    title: "Spider-Man: Into the Spider-Verse",
    suggestedBy: "Colette",
    suitableFor: ["Amélie", "Colette"],
    watched: false,
  },
];

export const FALLBACK_SHOPPING_LIST: ShoppingList = {
  id: "shopping-list-1",
  title: "Handleliste",
  items: [
    {
      id: "shopping-1",
      title: "Melk",
      quantity: "2 kartonger",
      addedBy: "Mamma",
      checked: false,
      createdAt: "2026-08-21T06:20:00.000Z",
    },
    {
      id: "shopping-2",
      title: "Tacolefser",
      quantity: "1 pakke",
      note: "Gjerne store",
      addedBy: "Pappa",
      checked: false,
      createdAt: "2026-08-18T16:10:00.000Z",
    },
    {
      id: "shopping-3",
      title: "Bananer",
      quantity: "6 stk",
      addedBy: "Linnea",
      checked: true,
      createdAt: "2026-08-10T14:00:00.000Z",
    },
  ],
};

export const FALLBACK_RECIPES: Recipe[] = [
  {
    id: "recipe-1",
    title: "Kremet tomatpasta",
    url: "https://example.com/tomatpasta",
    ingredients: [
      "400 g pasta",
      "2 fedd hvitløk",
      "2 ss tomatpure",
      "2 dl floete",
      "Parmesan",
    ],
    steps: [
      "Kok pasta etter anvisning.",
      "Stek hvitløk og tomatpuré i litt olje.",
      "Rør inn fløte og parmesan før pastaen vendes inn.",
    ],
    comments: ["God med litt chili og frisk basilikum."],
  },
  {
    id: "recipe-2",
    title: "Enkel gulrotsuppe",
    url: "https://example.com/gulrotsuppe",
    ingredients: [
      "1 løk",
      "6 gulrøtter",
      "7 dl kraft",
      "1 ss sitronsaft",
    ],
    steps: [
      "Surr løk og gulrotbiter myke i en gryte.",
      "Hell over kraft og kok til grønnsakene er møre.",
      "Kjør glatt og smak til med sitron og pepper.",
    ],
    comments: ["Server gjerne med grovt broed ved siden av."],
  },
];

export const FALLBACK_SINGLE_EVENTS: SingleEvent[] = [
  {
    id: "single-1",
    title: "Bursdagsfeiring hos Emma",
    category: "bursdag",
    date: "2026-08-22T00:00:00.000Z",
    time: "13:00",
    endTime: "16:00",
    note: "Gave er kjøpt, ligger i gangen.",
    familyMember: "Linnea",
  },
  {
    id: "single-2",
    title: "Tannlege",
    category: "avtale",
    date: "2026-08-23T00:00:00.000Z",
    time: "09:30",
    familyMember: "Colette",
  },
  {
    id: "single-3",
    title: "Tur til Tusenfryd",
    category: "tur",
    date: "2026-08-29T00:00:00.000Z",
    allDay: true,
    familyMember: "Pappa",
  },
];

export const FALLBACK_FEATURE_SUGGESTIONS: FeatureSuggestion[] = [
  {
    id: "suggestion-1",
    title: "Ukemeny",
    text: "En egen side der vi kan planlegge middager for hele uken.",
  },
  {
    id: "suggestion-2",
    title: "Bursdagskalender",
    text: "Vis kommende bursdager i familien så vi ikke glemmer noen.",
  },
];

export const FALLBACK_SHORT_MESSAGES: ShortMessage[] = [
  {
    id: "message-1",
    recipients: ["all"],
    text: "Husk å sette skoene på plass i gangen.",
    createdAt: "2026-08-22T08:00:00.000Z",
  },
  {
    id: "message-2",
    recipients: ["parents"],
    text: "Foreldremøte på tirsdag kl. 18.",
    createdAt: "2026-08-21T16:30:00.000Z",
  },
];

export const FALLBACK_RECURRING_EVENTS: RecurringEvent[] = [
  {
    id: "event-1",
    title: "Pianotimer",
    category: "fritid",
    dayOfWeek: "monday",
    time: "15:00",
    endTime: "16:00",
    whatToBring: "Noteperm og pianobok.",
    startDate: "2026-08-17T00:00:00.000Z",
    endDate: "2026-12-14T00:00:00.000Z",
    familyMember: "Amélie",
  },
  {
    id: "event-2",
    title: "Gym på skolen",
    category: "skole",
    dayOfWeek: "thursday",
    whatToBring: "Gymtøy, innesko og vannflaske.",
    familyMember: "Colette",
  },
];
