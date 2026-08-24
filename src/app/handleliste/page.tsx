import { AddButton } from "@/components/add-button";
import { ShoppingListBrowser } from "@/components/shopping-list-browser";
import { ShoppingListForm } from "@/components/shopping-list-form";
import { getFamilyMembers, getShoppingList } from "@/lib/data";

export default async function HandlelistePage() {
  const [familyMembers, shoppingList] = await Promise.all([
    getFamilyMembers(),
    getShoppingList(),
  ]);

  const remainingItems = shoppingList.items.filter((item) => !item.checked);

  return (
    <main className="shell">
      <section className="sectionHero accentFuture">
        <div>
          <span className="kicker">Handleliste</span>
          <h1>Handleliste</h1>
{/*           <p>Alle kan legge til varer raskt, mens voksne kan holde orden i Sanity Studio.</p> */}
        </div>
        <div className="sectionBadge">{remainingItems.length} må kjøpes</div>
      </section>

      <section className="listStack">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>{shoppingList.title}</h2>
          </div>

          {shoppingList.items.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                🛒
              </span>
              <h3>Handlelisten er tom</h3>
              <p>Legg til den foerste varen i skjemaet.</p>
            </div>
          ) : (
            <ShoppingListBrowser items={shoppingList.items} />
          )}
        </div>
      </section>

      <AddButton title="Legg til vare" label="Legg til vare" anchor="add-item">
        <ShoppingListForm
          familyMembers={familyMembers.map((member) => member.name)}
          previousItems={shoppingList.items}
        />
      </AddButton>
    </main>
  );
}
