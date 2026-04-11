"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { ShoppingListEntry } from "@/lib/types";

type ShoppingListBrowserProps = {
  items: ShoppingListEntry[];
};

export function ShoppingListBrowser({ items }: ShoppingListBrowserProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedItems = useMemo(() => {
    return [...localItems].sort((left, right) => {
      if (left.checked === right.checked) {
        return 0;
      }

      return left.checked ? 1 : -1;
    });
  }, [localItems]);

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

  return (
    <>
      <div className="groupStack">
        {sortedItems.map((item) => {
          const isPending = pendingId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={item.checked ? "shoppingToggle shoppingToggleChecked" : "shoppingToggle"}
              onClick={() => toggleItem(item.id)}
              disabled={isPending}
            >
              <article className={item.checked ? "itemCard shoppingItemChecked" : "itemCard"}>
                <div className="itemTitleRow">
                  <div className="shoppingItemTitleWrap">
                    <span className={item.checked ? "shoppingCheckbox shoppingCheckboxChecked" : "shoppingCheckbox"} aria-hidden="true">
                      {item.checked ? "✓" : ""}
                    </span>
                    <strong className={item.checked ? "shoppingItemTitle shoppingItemTitleChecked" : "shoppingItemTitle"}>
                      {item.title}
                    </strong>
                  </div>
                  <span className="itemMeta">
                    {isPending ? "Oppdaterer..." : item.checked ? "Kjøpt" : "Mangler"}
                  </span>
                </div>
                {item.quantity ? <p>Mengde: {item.quantity}</p> : null}
                {item.note ? <p>{item.note}</p> : null}
              </article>
            </button>
          );
        })}
      </div>

      {error ? <p className="feedback feedbackError">{error}</p> : null}
    </>
  );
}
