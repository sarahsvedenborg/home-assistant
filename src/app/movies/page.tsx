import { AddButton } from "@/components/add-button";
import { MovieBrowser } from "@/components/movie-browser";
import { MovieForm } from "@/components/movie-form";
import { getFamilyMembers, getMovieRecommendations } from "@/lib/data";

export default async function MoviesPage() {
  const [familyMembers, movies] = await Promise.all([
    getFamilyMembers(),
    getMovieRecommendations(),
  ]);

  return (
    <main className="shell moviesShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Filmer</h1>
        </div>
      </header>

      <section className="listStack">
        <MovieBrowser movies={movies} />
      </section>

      <AddButton
        title="Legg til filmforslag"
        label="Legg til film"
        anchor="add-movie"
        modalClassName="formModalMovies"
      >
        <MovieForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>
    </main>
  );
}
