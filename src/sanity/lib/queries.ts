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
  dayOfWeek,
  time,
  whatToBring,
  "familyMember": coalesce(familyMember->name, familyMemberName)
}`;

export const SHOPPING_LIST_QUERY = `*[_type == "shoppingList"][0] {
  _id,
  title,
  items[]{
    _key,
    title,
    quantity,
    note,
    addedBy,
    checked
  }
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
