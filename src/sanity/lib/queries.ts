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
  "suggestedBy": coalesce(familyMember->name, suggestedByName)
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
