import { ShoppingListForm } from "@/components/shopping-list-form";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getShoppingList } from "@/lib/data";

export default async function HandlelistePage() {
  const [familyMembers, shoppingList] = await Promise.all([
    getFamilyMembers(),
    getShoppingList(),
  ]);

  const remainingItems = shoppingList.items.filter((item) => !item.checked);

  return (
    <main className="shell">
      <SiteHeader current="handleliste" />

      <section className="sectionHero accentFuture">
        <div>
          <span className="kicker">Handleliste</span>
          <h1>En delt liste for alt familien trenger aa kjope.</h1>
          <p>Alle kan legge til varer raskt, mens voksne kan holde orden i Sanity Studio.</p>
        </div>
        <div className="sectionBadge">{remainingItems.length} varer gjenstaar</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>{shoppingList.title}</h2>
            <p>Listen er lagret i ett Sanity-dokument, saa hele familien ser samme oversikt.</p>
          </div>

          {shoppingList.items.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                🛒
              </span>
              <h3>Handlelisten er tom</h3>
              <p>Legg til den foerste varen i skjemaet ved siden av.</p>
            </div>
          ) : (
            <div className="groupStack">
              {shoppingList.items.map((item) => (
                <article key={item.id} className={item.checked ? "itemCard shoppingItemChecked" : "itemCard"}>
                  <div className="itemTitleRow">
                    <strong>{item.title}</strong>
                    <span className="itemMeta">{item.checked ? "Kjoept" : "Mangler"}</span>
                  </div>
                  {item.quantity ? <p>Mengde: {item.quantity}</p> : null}
                  {item.note ? <p>{item.note}</p> : null}
                  {item.addedBy ? <p>Lagt til av {item.addedBy}</p> : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <ShoppingListForm familyMembers={familyMembers.map((member) => member.name)} />
        </div>
      </section>
    </main>
  );
}
