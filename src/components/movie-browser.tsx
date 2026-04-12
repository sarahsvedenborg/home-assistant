"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import type { MovieRecommendation } from "@/lib/types";

type MovieBrowserProps = {
  familyMembers: string[];
  movies: MovieRecommendation[];
};

export function MovieBrowser({ familyMembers, movies }: MovieBrowserProps) {
  const [selectedMember, setSelectedMember] = useState<string>("alle");

  const filteredMovies = useMemo(() => {
    if (selectedMember === "alle") {
      return movies;
    }

    return movies.filter((movie) => movie.suitableFor.includes(selectedMember));
  }, [movies, selectedMember]);

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
        <div className="movieGrid">
          {filteredMovies.map((movie) => (
            <article className="movieCard" key={movie.id}>
              <div className="movieBody">
                <h3>{movie.title}</h3>
                {movie.suitableFor.length > 0 ? (
                  <p>Passer for {movie.suitableFor.join(", ")}</p>
                ) : null}
                {movie.link ? (
                  <a href={movie.link} target="_blank" rel="noreferrer" className="inlineLink">
                    Åpne filmlenke
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
