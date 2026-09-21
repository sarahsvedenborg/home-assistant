"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { READING_TYPE_OPTIONS } from "@/lib/readings";
import type { BookSearchHit, ReadingKind } from "@/lib/types";

type BookFormProps = {
  familyMembers: string[];
  onSuccess?: (message: string) => void;
};

const messageClassNames = {
  error: "feedback feedbackError",
  success: "feedback feedbackSuccess",
};

export function BookForm({ familyMembers, onSuccess }: BookFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [website, setWebsite] = useState("");
  const [readerNames, setReaderNames] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState("");
  const [finishedAt, setFinishedAt] = useState("");
  const [readingType, setReadingType] = useState<ReadingKind>("self");
  const [results, setResults] = useState<BookSearchHit[]>([]);
  const [selected, setSelected] = useState<BookSearchHit | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const canSubmit =
    Boolean(selected) &&
    readerNames.length > 0 &&
    (readingType !== "together" || readerNames.length >= 2);

  function resetForm() {
    setQuery("");
    setReaderNames([]);
    setStartedAt("");
    setFinishedAt("");
    setReadingType("self");
    setResults([]);
    setSelected(null);
    setHasSearched(false);
  }

  async function searchBooks() {
    const trimmed = query.trim();
    if (trimmed.length < 2 || isSearching) {
      return;
    }

    setIsSearching(true);
    setMessage(null);
    setSelected(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}`);
      const result = (await response.json()) as {
        books?: BookSearchHit[];
        error?: string;
      };

      if (!response.ok) {
        setResults([]);
        setMessage({ kind: "error", text: result.error || "Søket fungerte ikke." });
        return;
      }

      setResults(result.books || []);
    } catch {
      setResults([]);
      setMessage({ kind: "error", text: "Kunne ikke søke akkurat nå." });
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void searchBooks();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (readerNames.length === 0) {
      setMessage({ kind: "error", text: "Velg hvem boken gjelder." });
      return;
    }

    if (!selected) {
      setMessage({ kind: "error", text: "Velg en bok fra søket først." });
      return;
    }

    if (readingType === "together" && readerNames.length < 2) {
      setMessage({ kind: "error", text: "Sammen-lesing trenger minst to lesere." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: selected.source,
          id: selected.id,
          readerNames,
          startedAt,
          finishedAt,
          readingType,
          website,
        }),
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setMessage({ kind: "error", text: result.error || "Det fungerte ikke." });
        return;
      }

      const successText = result.message || "Boken er lagt til!";
      resetForm();
      router.refresh();

      if (onSuccess) {
        onSuccess(successText);
      } else {
        setMessage({ kind: "success", text: successText });
      }
    } catch {
      setMessage({ kind: "error", text: "Noe gikk galt. Prøv igjen." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
        <h2>Legg til bok</h2>
      </div>

      <div className="formGrid">
        <fieldset className="field fieldWide checkboxFieldset">
          <legend>Hvem</legend>
          <div className="checkboxGrid eventParticipantGrid">
            {familyMembers.map((member) => {
              const checked = readerNames.includes(member);

              return (
                <label className="checkboxOption" key={member}>
                  <input
                    className="checkboxInput"
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      setReaderNames((current) =>
                        event.target.checked
                          ? [...current, member]
                          : current.filter((name) => name !== member),
                      )
                    }
                  />
                  <span
                    className={
                      checked ? "checkboxLabel checkboxLabelChecked" : "checkboxLabel"
                    }
                  >
                    {member}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field fieldWide">
          <span>Søk etter tittel</span>
          <div className="bookSearchRow">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Sofies verden"
              maxLength={120}
              autoComplete="off"
            />
            <button
              className="buttonSecondary"
              type="button"
              onClick={() => void searchBooks()}
              disabled={isSearching || query.trim().length < 2}
            >
              {isSearching ? "Søker…" : "Søk"}
            </button>
          </div>
        </label>

        {hasSearched && !isSearching && results.length === 0 ? (
          <p className="bookSearchEmpty fieldWide">Ingen bøker funnet. Prøv en annen tittel.</p>
        ) : null}

        {results.length > 0 ? (
          <div className="bookSearchResults fieldWide" role="listbox" aria-label="Søkeresultater">
            {results.map((book) => {
              const isSelected = selected?.source === book.source && selected.id === book.id;

              return (
                <button
                  key={`${book.source}-${book.id}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={isSelected ? "bookSearchHit bookSearchHitSelected" : "bookSearchHit"}
                  onClick={() => setSelected(book)}
                >
                  {book.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverUrl} alt="" className="bookSearchCover" />
                  ) : (
                    <span className="bookSearchCover bookCoverFallback" aria-hidden="true">
                      📚
                    </span>
                  )}
                  <span className="bookSearchCopy">
                    <strong>{book.title}</strong>
                    <span>{book.author}</span>
                    <span>
                      {[book.publicationYear, book.source === "boktyven" ? "Norge" : "Internasjonalt"]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <label className="field">
          <span>Startdato</span>
          <input
            type="date"
            value={startedAt}
            onChange={(event) => {
              const nextStartedAt = event.target.value;
              setStartedAt(nextStartedAt);
              setFinishedAt((current) =>
                current && nextStartedAt && current < nextStartedAt ? "" : current,
              );
            }}
          />
        </label>

        <label className="field">
          <span>Sluttdato (valgfritt)</span>
          <input
            type="date"
            value={finishedAt}
            min={startedAt || undefined}
            onChange={(event) => setFinishedAt(event.target.value)}
          />
        </label>

        <fieldset className="field fieldWide checkboxFieldset">
          <legend>Måte</legend>
          <div className="checkboxGrid eventParticipantGrid">
            {READING_TYPE_OPTIONS.map((option) => {
              const checked = readingType === option.value;

              return (
                <label className="checkboxOption" key={option.value}>
                  <input
                    className="radioInput"
                    type="radio"
                    name="reading-type"
                    value={option.value}
                    checked={checked}
                    onChange={() => setReadingType(option.value)}
                    required
                  />
                  <span
                    className={
                      checked ? "checkboxLabel checkboxLabelChecked" : "checkboxLabel"
                    }
                  >
                    {option.title}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="srOnly" aria-hidden="true">
          La dette feltet stå tomt
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      <div className="formActions">
        <button
          className="buttonPrimary"
          type="submit"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Lagrer…" : "Legg til bok"}
        </button>
      </div>

      {message ? (
        <p className={messageClassNames[message.kind]} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
