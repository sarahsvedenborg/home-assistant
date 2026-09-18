"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { MOVIE_AUDIENCES } from "@/lib/movie-audiences";
import type { MovieRecommendation } from "@/lib/types";

type MovieBrowserProps = {
  movies: MovieRecommendation[];
};

export function MovieBrowser({ movies }: MovieBrowserProps) {
  const [selectedAudience, setSelectedAudience] = useState<string>("Hele familien");
  const [localMovies, setLocalMovies] = useState(movies);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalMovies(movies);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return selectedAudience === "alle"
      ? localMovies
      : localMovies.filter((movie) => movie.suitableFor === selectedAudience);
  }, [localMovies, selectedAudience]);

  const unseenMovies = useMemo(
    () => filteredMovies.filter((movie) => !movie.watched),
    [filteredMovies],
  );
  const seenMovies = useMemo(
    () => filteredMovies.filter((movie) => movie.watched),
    [filteredMovies],
  );

  async function toggleMovie(id: string) {
    const currentMovie = localMovies.find((movie) => movie.id === id);

    if (!currentMovie) {
      return;
    }

    const nextWatched = !currentMovie.watched;

    setPendingId(id);
    setError(null);
    setLocalMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, watched: nextWatched } : movie)),
    );

    try {
      const response = await fetch("/api/submissions/movies", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setLocalMovies((current) =>
          current.map((movie) => (movie.id === id ? { ...movie, watched: currentMovie.watched } : movie)),
        );
        setError(result.error || "Kunne ikke oppdatere filmen.");
        return;
      }

      const result = (await response.json()) as { watched: boolean };
      setLocalMovies((current) =>
        current.map((movie) => (movie.id === id ? { ...movie, watched: result.watched } : movie)),
      );
    } catch {
      setLocalMovies((current) =>
        current.map((movie) => (movie.id === id ? { ...movie, watched: currentMovie.watched } : movie)),
      );
      setError("Noe gikk galt. Proev igjen.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="listPanel">
      <div className="panelHeading panelHeadingStacked">
        <div className="filterChipRow" aria-label="Filtrer filmer etter hvem de passer for">
          {MOVIE_AUDIENCES.map((audience) => (
            <button
              key={audience.value}
              type="button"
              className={
                selectedAudience === audience.value
                  ? "filterChip filterChipActive"
                  : "filterChip"
              }
              onClick={() => setSelectedAudience(audience.value)}
            >
              {audience.label}
            </button>
          ))}
           <button
            type="button"
            className={selectedAudience === "alle" ? "filterChip filterChipActive" : "filterChip"}
            onClick={() => setSelectedAudience("alle")}
          >
            Alle filmer
          </button>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <EmptyState
          title="Ingen filmer registrert for denne gruppen"
          description="Velg en annen gruppe eller legg til et nytt forslag."
        />
      ) : (
        <div className="messageArchiveGroups">
          <section className="messageArchiveSection" aria-labelledby="unseen-movies-title">
            <h3 id="unseen-movies-title">Ikke sett</h3>
            <MovieTable
              movies={unseenMovies}
              emptyText="Ingen usette filmer."
              pendingId={pendingId}
              onToggle={toggleMovie}
            />
          </section>

          <section className="messageArchiveSection" aria-labelledby="seen-movies-title">
            <h3 id="seen-movies-title">Sett</h3>
            <MovieTable
              movies={seenMovies}
              emptyText="Ingen sette filmer."
              pendingId={pendingId}
              onToggle={toggleMovie}
            />
          </section>
        </div>
      )}

      {error ? <p className="feedback feedbackError">{error}</p> : null}
    </div>
  );
}

function MovieTable({
  movies,
  emptyText,
  pendingId,
  onToggle,
}: {
  movies: MovieRecommendation[];
  emptyText: string;
  pendingId: string | null;
  onToggle: (id: string) => void;
}) {
  if (movies.length === 0) {
    return <p className="messageArchiveEmpty">{emptyText}</p>;
  }

  return (
    <div className="movieTable">
      <div className="movieTableHeader">
        <span>Tittel</span>
        <span>Trailer</span>
        <span aria-hidden="true" />
      </div>

      <div className="movieTableBody">
        {movies.map((movie) => {
          const isPending = pendingId === movie.id;

          return (
            <article key={movie.id} className="movieTableRow">
              <div className="movieTitleCell">
                <strong>{movie.title}</strong>
              </div>
              <span className="movieTrailerCell">
                {movie.link ? (
                  <a
                    href={movie.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inlineLink"
                  >
                    Se trailer
                  </a>
                ) : null}
              </span>
              <div className="movieActionCell">
                <button
                  type="button"
                  className={
                    movie.watched
                      ? "shoppingToggle shoppingToggleChecked"
                      : "shoppingToggle"
                  }
                  onClick={() => onToggle(movie.id)}
                  disabled={isPending}
                  aria-label={
                    movie.watched
                      ? `Marker ${movie.title} som usett`
                      : `Marker ${movie.title} som sett`
                  }
                >
                  {isPending
                    ? "Oppdaterer…"
                    : movie.watched
                      ? "Marker som usett"
                      : "Marker som sett"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
