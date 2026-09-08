import { AddButton } from "@/components/add-button";
import { ShoppingListBrowser } from "@/components/shopping-list-browser";
import { ShoppingListForm } from "@/components/shopping-list-form";
import { getShoppingList } from "@/lib/data";

export default async function HandlelistePage() {
  const shoppingList = await getShoppingList();

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
        {shoppingList.items.length === 0 ? (
          <div className="listPanel">
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                🛒
              </span>
              <h3>Handlelisten er tom</h3>
              <p>Legg til den foerste varen i skjemaet.</p>
            </div>
          </div>
        ) : (
          <ShoppingListBrowser items={shoppingList.items} />
        )}
      </section>

      <AddButton
        title="Legg til vare"
        label="Legg til vare"
        anchor="add-item"
        hideTriggerOnMobile
      >
        <ShoppingListForm previousItems={shoppingList.items} />
      </AddButton>
    </main>
  );
}
