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
          <span className="kicker">Movie night</span>
          <h1>Keep a happy stack of family picks ready for the next popcorn night.</h1>
          <p>Browse suggestions, spot what is already watched, and save the next favorite.</p>
        </div>
        <div className="sectionBadge">{movies.filter((movie) => !movie.watched).length} still to watch</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Movie picks</h2>
            <p>Posters are optional, so a title alone is enough to save a great idea.</p>
          </div>

          {movies.length === 0 ? (
            <EmptyState
              title="No movies yet"
              description="Add the first recommendation and start planning movie night."
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
                      {movie.watched ? "Watched" : "Watch next"}
                    </span>
                  </div>
                  <div className="movieBody">
                    <h3>{movie.title}</h3>
                    <p>Suggested by {movie.suggestedBy}</p>
                    {movie.link ? (
                      <a href={movie.link} target="_blank" rel="noreferrer" className="inlineLink">
                        Open movie link
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
