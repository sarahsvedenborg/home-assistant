import { AddButton } from "@/components/add-button";
import { FeatureSuggestionForm } from "@/components/feature-suggestion-form";
import { SiteHeader } from "@/components/site-header";
import { getFeatureSuggestions } from "@/lib/data";

export default async function ForslagPage() {
  const suggestions = await getFeatureSuggestions();

  return (
    <main className="shell">
      <SiteHeader current="forslag" />

      <section className="sectionHero accentFuture">
        <div>
          <span className="kicker">Forslag</span>
          <h1 style={{ margin: "0.25em 0" }}>Funksjonsforslag</h1>
        </div>
        <div className="sectionBadge">{suggestions.length} forslag</div>
      </section>

      <section className="listStack">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Foreslåtte funksjoner</h2>
          </div>

          {suggestions.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                💡
              </span>
              <h3>Ingen forslag enda</h3>
              <p>Legg til det første forslaget i skjemaet.</p>
            </div>
          ) : (
            <ul className="itemList">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} className="itemCard">
                  <div className="itemTitleRow">
                    <strong>{suggestion.title}</strong>
                  </div>
                  {suggestion.text ? <p>{suggestion.text}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <AddButton title="Foreslå en ny funksjon" label="Nytt forslag">
        <FeatureSuggestionForm />
      </AddButton>
    </main>
  );
}
