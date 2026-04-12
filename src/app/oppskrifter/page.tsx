import { RecipeForm } from "@/components/recipe-form";
import { SiteHeader } from "@/components/site-header";
import { getRecipes } from "@/lib/data";

export default async function OppskrifterPage() {
  const recipes = await getRecipes();

  return (
    <main className="shell">
      <SiteHeader current="oppskrifter" />

      <section className="sectionHero accentCoolPanel">
        <div>
          <span className="kicker">Oppskrifter</span>
          <h1>Oppskrifter</h1>
        </div>
        <div className="sectionBadge">{recipes.length} oppskrifter</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Lagrede oppskrifter</h2>
          </div>

          {recipes.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                🍲
              </span>
              <h3>Ingen oppskrifter enda</h3>
              <p>Legg til den foerste oppskriften i skjemaet ved siden av.</p>
            </div>
          ) : (
            <div className="groupStack">
              {recipes.map((recipe) => (
                <article key={recipe.id} className="itemCard">
                  <div className="itemTitleRow">
                    <strong>{recipe.title}</strong>
                  </div>
                  <a href={recipe.url} target="_blank" rel="noreferrer" className="inlineLink">
                    Gå til oppskrift
                  </a>
                  <div className="recipeContentStack">
                    {recipe.content.map((paragraph, index) => (
                      <p key={`${recipe.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <RecipeForm />
        </div>
      </section>
    </main>
  );
}
