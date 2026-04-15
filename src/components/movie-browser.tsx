"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import type { MovieRecommendation } from "@/lib/types";

type MovieBrowserProps = {
  familyMembers: string[];
  movies: MovieRecommendation[];
};

export function MovieBrowser({ familyMembers, movies }: MovieBrowserProps) {
  const [selectedMember, setSelectedMember] = useState<string>("alle");
  const [localMovies, setLocalMovies] = useState(movies);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalMovies(movies);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const relevantMovies =
      selectedMember === "alle"
        ? localMovies
        : localMovies.filter((movie) => movie.suitableFor.includes(selectedMember));

    return [...relevantMovies].sort((left, right) => Number(left.watched) - Number(right.watched));
  }, [localMovies, selectedMember]);

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
        <h2>Filmforslag</h2>
        <div className="filterChipRow" aria-label="Filtrer filmer etter familiemedlem">
          <button
            type="button"
            className={selectedMember === "alle" ? "filterChip filterChipActive" : "filterChip"}
            onClick={() => setSelectedMember("alle")}
          >
            Alle
          </button>
          {familyMembers.map((member) => (
            <button
              key={member}
              type="button"
              className={selectedMember === member ? "filterChip filterChipActive" : "filterChip"}
              onClick={() => setSelectedMember(member)}
            >
              {member}
            </button>
          ))}
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <EmptyState
          title="Ingen filmer passer akkurat naa"
          description="Velg et annet familiemedlem eller legg til et nytt forslag."
        />
      ) : (
        <div className="movieTable">
          <div className="movieTableHeader">
            <span>Tittel</span>
            <span>Status</span>
            <span>Trailer</span>
          </div>

          <div className="movieTableBody">
            {filteredMovies.map((movie) => {
              const isPending = pendingId === movie.id;

              return (
                <button
                  key={movie.id}
                  type="button"
                  className={movie.watched ? "movieTableButton movieTableButtonWatched" : "movieTableButton"}
                  onClick={() => toggleMovie(movie.id)}
                  disabled={isPending}
                >
                  <article className="movieTableRow">
                    <div className="movieTitleCell">
                      <strong>{movie.title}</strong>
                     {/*  {movie.link ? (
                        <a
                          href={movie.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inlineLink movieInlineLink"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Se trailer
                        </a>
                      ) : null} */}
                    </div>
                    <span className="movieStatusCell">
                      {isPending ? "Oppdaterer..." : movie.watched ? "Sett" : "Ikke sett"}
                    </span>
                    <span className="movieTrailerCell">
                      {movie.link ? (
                        <a
                          href={movie.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inlineLink"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Se trailer
                        </a>
                      ) : (
                      null
                      )}
                    </span>
                  </article>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error ? <p className="feedback feedbackError">{error}</p> : null}
    </div>
  );
}
