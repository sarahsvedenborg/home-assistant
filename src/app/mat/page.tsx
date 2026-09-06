import { getDinners } from "@/lib/data";
import type { DinnerCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<DinnerCategory, string> = {
  regular: "Vanlig middag",
  cozy: "Kosemiddag",
  simple: "Enkel",
  trip: "Tur",
};

const WEEKS = [
  { title: "Uke 1", days: [1, 2, 3, 4, 5, 6, 7] },
  { title: "Uke 2", days: [8, 9, 10, 11, 12, 13, 14] },
] as const;

export default async function MatPage() {
  const dinners = await getDinners();

  return (
    <main className="shell mealPlanShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Mat</h1>
          <p>14-dagers middagsplan</p>
        </div>
      </header>

      <div className="mealPlanWeeks">
        {WEEKS.map((week, weekIndex) => (
          <section
            className="mealPlanWeek"
            aria-labelledby={`meal-week-${weekIndex + 1}`}
            key={week.title}
          >
            <h2 id={`meal-week-${weekIndex + 1}`}>{week.title}</h2>

            <div className="mealPlanGrid">
              {week.days.map((day) => {
                const meals = dinners.filter((dinner) => dinner.day === day);

                return (
                  <article className="mealPlanDay" key={day}>
                    <header className="mealPlanDayHeader">
                      <span>Dag</span>
                      <strong>{day}</strong>
                    </header>

                    {meals.length > 0 ? (
                      <div className="mealPlanDayContent">
                        {meals.map((dinner) => (
                          <div className="mealPlanDinner" key={dinner.id}>
                            <h3>{dinner.title}</h3>

                            {dinner.categories.length > 0 ? (
                              <div className="mealPlanCategories" aria-label="Kategorier">
                                {dinner.categories.map((category) => (
                                  <span key={category}>
                                    {CATEGORY_LABELS[category]}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {dinner.ingredients.length > 0 ? (
                              <ul className="mealPlanIngredients">
                                {dinner.ingredients.map((ingredient, index) => (
                                  <li key={`${dinner.id}-${index}`}>{ingredient}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mealPlanEmpty">Ingen middag valgt</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
