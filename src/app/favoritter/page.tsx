import { EmptyState } from "@/components/empty-state";
import { getFavouriteQuotes } from "@/lib/data";

export default async function FavouriteQuotesPage() {
  const quotes = await getFavouriteQuotes();

  return (
    <main className="shell quotesShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Favorittsitater</h1>
        </div>
      </header>

      {quotes.length === 0 ? (
        <EmptyState
          title="Ingen favoritter ennå"
          description="Trykk på hjertet ved dagens sitat for å lagre det her."
        />
      ) : (
        <ul className="quoteList">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <figure className="itemCard savedQuote">
                <blockquote>“{quote.text}”</blockquote>
                <figcaption>— {quote.author}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
