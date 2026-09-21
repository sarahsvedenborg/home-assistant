import type { Book } from "@/lib/types";

type BookCoverProps = {
  book: Book;
  className?: string;
};

export function BookCover({ book, className }: BookCoverProps) {
  if (book.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.coverUrl}
        alt={book.coverAlt || `Omslag for ${book.title}`}
        className={className}
      />
    );
  }

  return (
    <span className={`${className || ""} bookCoverFallback`.trim()} aria-hidden="true">
      📚
    </span>
  );
}
