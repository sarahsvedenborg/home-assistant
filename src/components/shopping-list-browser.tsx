"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ShoppingListEntry } from "@/lib/types";

type ShoppingListBrowserProps = {
  items: ShoppingListEntry[];
};

export function ShoppingListBrowser({ items }: ShoppingListBrowserProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleItem(id: string) {
    setPendingId(id);
    setError(null);

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
        setError(result.error || "Kunne ikke oppdatere varen.");
        return;
      }

      router.refresh();
    } catch {
      setError("Noe gikk galt. Proev igjen.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <div className="groupStack">
        {items.map((item) => {
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
                  <strong>{item.title}</strong>
                  <span className="itemMeta">
                    {isPending ? "Oppdaterer..." : item.checked ? "Kjoept" : "Mangler"}
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
