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
        <div className="movieTable">
          <div className="movieTableHeader">
            <span>Tittel</span>
         {/*    <span>Passer for</span> */}
            <span>Status</span>
            <span>Trailer</span>
          </div>

          <div className="movieTableBody">
            {filteredMovies.map((movie) => (
              <article className="movieTableRow" key={movie.id}>
                <strong>{movie.title}</strong>
{/*                 <span>{movie.suitableFor.length > 0 ? movie.suitableFor.join(", ") : "Alle"}</span> */}
                <span>{movie.watched ? "Sett" : "Ikke sett"}</span>
                <span>
                  {movie.link ? (
                    <a href={movie.link} target="_blank" rel="noreferrer" className="inlineLink">
                      Se trailer
                    </a>
                  ) : (
                    "-"
                  )}
                </span>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
