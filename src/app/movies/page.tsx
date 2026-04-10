import Image from "next/image";

import { EmptyState } from "@/components/empty-state";
import { MovieForm } from "@/components/movie-form";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getMovieRecommendations } from "@/lib/data";

export default async function MoviesPage() {
  const [familyMembers, movies] = await Promise.all([
    getFamilyMembers(),
    getMovieRecommendations(),
  ]);

  return (
    <main className="shell">
      <SiteHeader current="movies" />

      <section className="sectionHero accentCoolPanel">
        <div>
          <span className="kicker">Filmkveld</span>
          <h1>Ha en koselig samling familiefilmer klar til neste popcornkveld.</h1>
          <p>Se forslag, hold styr på hva som er sett, og lagre neste favoritt.</p>
        </div>
        <div className="sectionBadge">{movies.filter((movie) => !movie.watched).length} igjen å se</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Filmforslag</h2>
            <p>Plakater er valgfrie, så bare en tittel er nok til å lagre en god idé.</p>
          </div>

          {movies.length === 0 ? (
            <EmptyState
              title="Ingen filmer enda"
              description="Legg til det første forslaget og begynn å planlegge filmkveld."
            />
          ) : (
            <div className="movieGrid">
              {movies.map((movie) => (
                <article className="movieCard" key={movie.id}>
                  <div className="moviePosterWrap">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={`Poster for ${movie.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1120px) 50vw, 280px"
                        className="moviePoster"
                      />
                    ) : (
                      <div className="moviePosterFallback" aria-hidden="true">
                        <span>🎞️</span>
                      </div>
                    )}
                    <span className={movie.watched ? "watchBadge watched" : "watchBadge"}>
                      {movie.watched ? "Sett" : "Se neste"}
                    </span>
                  </div>
                  <div className="movieBody">
                    <h3>{movie.title}</h3>
                    <p>Foreslatt av {movie.suggestedBy}</p>
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

        <div id="add-movie">
          <MovieForm familyMembers={familyMembers.map((member) => member.name)} />
        </div>
      </section>
    </main>
  );
}
