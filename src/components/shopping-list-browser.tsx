"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ShoppingListEntry } from "@/lib/types";

type ShoppingListBrowserProps = {
  items: ShoppingListEntry[];
};

export function ShoppingListBrowser({ items }: ShoppingListBrowserProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  async function toggleItem(id: string) {
    const currentItem = localItems.find((item) => item.id === id);

    if (!currentItem) {
      return;
    }

    const nextChecked = !currentItem.checked;

    setPendingId(id);
    setError(null);
    setLocalItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: nextChecked } : item)),
    );

    try {
      const response = await fetch("/api/submissions/handleliste", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setLocalItems((current) =>
          current.map((item) => (item.id === id ? { ...item, checked: currentItem.checked } : item)),
        );
        setError(result.error || "Kunne ikke oppdatere varen.");
        return;
      }

      const result = (await response.json()) as { checked: boolean };
      setLocalItems((current) =>
        current.map((item) => (item.id === id ? { ...item, checked: result.checked } : item)),
      );
    } catch {
      setLocalItems((current) =>
        current.map((item) => (item.id === id ? { ...item, checked: currentItem.checked } : item)),
      );
      setError("Noe gikk galt. Proev igjen.");
    } finally {
      setPendingId(null);
      router.refresh();
    }
  }

  const remainingItems = localItems.filter((item) => !item.checked);
  const boughtItems = localItems.filter((item) => item.checked);

  function renderItems(list: ShoppingListEntry[], emptyText: string) {
    if (list.length === 0) {
      return <p className="shoppingColumnEmpty">{emptyText}</p>;
    }

    return (
      <div className="groupStack">
        {list.map((item) => {
          const isPending = pendingId === item.id;

          return (
            <article
              key={item.id}
              className={
                item.checked ? "itemCard shoppingItemChecked" : "itemCard"
              }
            >
              <div className="itemTitleRow">
                <div className="shoppingItemTitleWrap">
                  <span
                    className={
                      item.checked
                        ? "shoppingCheckbox shoppingCheckboxChecked"
                        : "shoppingCheckbox"
                    }
                    aria-hidden="true"
                  >
                    {item.checked ? "✓" : ""}
                  </span>
                  <strong
                    className={
                      item.checked
                        ? "shoppingItemTitle shoppingItemTitleChecked"
                        : "shoppingItemTitle"
                    }
                  >
                    {item.title}
                  </strong>
                </div>
                <button
                  type="button"
                  className={
                    item.checked
                      ? "shoppingToggle shoppingToggleChecked"
                      : "shoppingToggle"
                  }
                  onClick={() => toggleItem(item.id)}
                  disabled={isPending}
                  aria-label={
                    item.checked
                      ? `Flytt ${item.title} til må kjøpes`
                      : `Marker ${item.title} som kjøpt`
                  }
                >
                  {isPending
                    ? "Oppdaterer…"
                    : item.checked
                      ? "Må kjøpes"
                      : "Marker som kjøpt"}
                </button>
              </div>
              {item.quantity ? <p>Mengde: {item.quantity}</p> : null}
              {item.note ? <p>{item.note}</p> : null}
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="shoppingListColumns">
        <section
          className="shoppingListColumn"
          aria-labelledby="shopping-needed-title"
        >
          <h2 id="shopping-needed-title">Må kjøpes</h2>
          {renderItems(remainingItems, "Ingenting mangler akkurat nå.")}
        </section>

        <section
          className="shoppingListColumn shoppingListColumnBought"
          aria-labelledby="shopping-usual-title"
        >
          <h2 id="shopping-usual-title">Pleier å kjøpe</h2>
          {renderItems(boughtItems, "Ingen tidligere kjøpte varer.")}
        </section>
      </div>

      {error ? <p className="feedback feedbackError">{error}</p> : null}
    </>
  );
}
