import { MovieBrowser } from "@/components/movie-browser";
import { MobileCollapsibleForm } from "@/components/mobile-collapsible-form";
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
          <h1 style={{margin: '0.2em 0'}}>Filmliste</h1>

        </div>
        <div className="sectionBadge">{movies.filter((movie) => !movie.watched).length} igjen å se</div>
      </section>

      <section className="contentGrid">
        <div className="mobileListSlot">
          <MovieBrowser familyMembers={familyMembers.map((member) => member.name)} movies={movies} />
        </div>

        <div id="add-movie" className="mobileFormSlot">
          <MobileCollapsibleForm title="Legg til filmforslag">
            <MovieForm familyMembers={familyMembers.map((member) => member.name)} />
          </MobileCollapsibleForm>
        </div>
      </section>
    </main>
  );
}
