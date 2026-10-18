export const QUOTE_TEXT_MAX = 500;
export const QUOTE_AUTHOR_MAX = 120;

export type SavedQuote = {
  text: string;
  author: string;
};

export function normalizeQuoteText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function quotesMatch(left: SavedQuote, right: SavedQuote) {
  return (
    normalizeQuoteText(left.text) === normalizeQuoteText(right.text) &&
    normalizeQuoteText(left.author) === normalizeQuoteText(right.author)
  );
}

export function favouriteQuoteKey(text: string, author: string) {
  const value = `${normalizeQuoteText(text)}|${normalizeQuoteText(author)}`;
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `q${(hash >>> 0).toString(36)}`;
}
