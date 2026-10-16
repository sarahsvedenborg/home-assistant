import Link from "next/link";

import { AddButton } from "@/components/add-button";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipes } from "@/lib/data";

export default async function OppskrifterPage() {
  const recipes = await getRecipes();



  return (
    <main className="shell recipesShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Oppskrifter</h1>
        </div>
      </header>

      <section className="listStack">
        <div className="listPanel">
          {recipes.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                🍲
              </span>
              <h3>Ingen oppskrifter enda</h3>
              <p>Legg til den foerste oppskriften i skjemaet.</p>
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

      </section>

      <AddButton title="Legg til oppskrift" label="Legg til oppskrift" anchor="add-recipe">
        <RecipeForm />
      </AddButton>
    </main>
  );
}
