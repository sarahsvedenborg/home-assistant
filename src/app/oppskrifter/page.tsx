import Link from "next/link";

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
          <h1 style={{margin: "0.25em 0"}}>Oppskrifter</h1>
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
                recipe.ingredients.length > 0 || recipe.steps.length > 0 ? (
                  <Link key={recipe.id} href={`/oppskrifter/${recipe.id}`} className="recipeCardLink">
                    <article className="itemCard recipeCard recipeCardInteractive">
                      <div className="itemTitleRow">
                        <strong>{recipe.title}</strong>
                      </div>
                    {/*   <div className="recipeMetaRow">
                        <span>{recipe.ingredients.length} ingredienslinjer</span>
                        <span>{recipe.steps.length} steg</span>
                      </div> */}
                    </article>
                  </Link>
                ) : (
                  <a
                    key={recipe.id}
                    href={recipe.url}
                    target="_blank"
                    rel="noreferrer"
                    className="recipeCardLink"
                  >
                    <article className="itemCard recipeCard recipeCardInteractive">
                      <div className="itemTitleRow">
                        <strong>{recipe.title}</strong>
                      </div>
                      <span className="inlineLink">Åpne ekstern oppskrift</span>
                    </article>
                  </a>
                )
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
