import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getRecipeById } from "@/lib/data";

type RecipeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const hasLocalContent = recipe.ingredients.length > 0 || recipe.steps.length > 0;

  if (!hasLocalContent && recipe.url) {
    redirect(recipe.url);
  }

  return (
    <main className="shell">
      <SiteHeader current="oppskrifter" />

   {/*    <section className="sectionHeroCompact accentCoolPanel"> */}
      <section className="sectionHeroCompact ">
        <div>
          <span className="kicker">Oppskrift</span>
          <h1 className="recipeDetailTitle">{recipe.title}</h1>
        </div>
      </section>

      <section className="contentGrid recipeDetailGrid">
        <article className="listPanel">
          {recipe.url ? (
            <a href={recipe.url} target="_blank" rel="noreferrer" className="inlineLink" style={{float: "right"}}>
              Åpne ekstern oppskrift
            </a>
          ) : null}

          <div className="recipeContentStack">
            {recipe.ingredients.length > 0 ? (
              <div>
                <strong>Ingredienser</strong>
                {recipe.ingredients.map((paragraph, index) => (
                  <p key={`${recipe.id}-ingredient-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {recipe.steps.length > 0 ? (
              <div>
                <strong>Steg</strong>
                {recipe.steps.map((paragraph, index) => (
                  <p key={`${recipe.id}-step-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {recipe.comments.length > 0 ? (
              <div>
                <strong>Kommentarer</strong>
                {recipe.comments.map((paragraph, index) => (
                  <p key={`${recipe.id}-comment-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
