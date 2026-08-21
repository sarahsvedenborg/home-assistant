export const FAMILY_MEMBERS_QUERY = `*[_type == "familyMember"] | order(sortOrder asc, name asc) {
  _id,
  name,
  role,
  emoji,
  accentColor
}`;

export const WISHLIST_ITEMS_QUERY = `*[_type == "wishListItem" && (!defined(status) || status == "approved")] | order(_createdAt desc) {
  _id,
  title,
  description,
  link,
  _createdAt,
  "submittedBy": coalesce(familyMember->name, submittedByName)
}`;

export const MOVIE_RECOMMENDATIONS_QUERY = `*[_type == "movieRecommendation" && (!defined(status) || status == "approved")] | order(watched asc, _createdAt desc) {
  _id,
  title,
  link,
  watched,
  suitableFor,
  "posterUrl": coalesce(poster.asset->url, posterUrl),
  "suggestedBy": familyMember->name
}`;

export const FEATURE_SUGGESTIONS_QUERY = `*[_type == "featureSuggestion" && (!defined(status) || status == "approved")] | order(_createdAt desc) {
  _id,
  title,
  text
}`;

export const RECURRING_EVENTS_QUERY = `*[_type == "recurringEvent" && (!defined(status) || status == "approved")] | order(dayOfWeek asc, time asc) {
  _id,
  title,
  category,
  dayOfWeek,
  time,
  endTime,
  whatToBring,
  startDate,
  endDate,
  "familyMember": coalesce(familyMember->name, familyMemberName)
}`;

// Shopping items are now standalone documents (one per item) so each carries
// its own _createdAt, which powers the "Nytt i familien" feed on the homepage.
export const SHOPPING_LIST_ITEMS_QUERY = `*[_type == "shoppingListItem"] | order(_createdAt desc) {
  _id,
  title,
  quantity,
  note,
  addedBy,
  checked,
  _createdAt
}`;

export const RECIPES_QUERY = `*[_type == "recipe"] | order(_createdAt desc) {
  _id,
  title,
  url,
  ingredients[]{
    ...
  },
  steps[]{
    ...
  },
  content[]{
    ...,
    children[]{
      ...
    }
  }
}`;
