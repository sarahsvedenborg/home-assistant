"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FormModal } from "@/components/form-modal";
import { ShoppingListForm } from "@/components/shopping-list-form";
import type { ShoppingListEntry } from "@/lib/types";

export function ShoppingWidget({
  items,
}: {
  items: ShoppingListEntry[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const remainingItems = items.filter((item) => !item.checked);

  useEffect(() => {
    if (!confirmation) {
      return;
    }

    const timer = setTimeout(() => {
      setConfirmation(null);
      setIsOpen(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [confirmation]);

  function closeModal() {
    setConfirmation(null);
    setIsOpen(false);
  }

  return (
    <>
      <article className="widget wDinner accentWarm">
        <div className="widgetHead shoppingWidgetHead">
          <h2 className="widgetTitle shoppingWidgetTitle">
            <span aria-hidden="true">🛒</span> Handleliste
          </h2>
          <div className="widgetMessageActions shoppingWidgetActions">
            <Link href="/handleliste" className="widgetTextLink">
              Se alle
            </Link>
            <button type="button" className="widgetAddButton" onClick={() => setIsOpen(true)}>
              Ny vare
            </button>
          </div>
        </div>

        {remainingItems.length === 0 ? (
          <p className="widgetEmpty">Handlelisten er tom 🎉</p>
        ) : (
          <ul className="widgetList">
            {remainingItems.slice(0, 6).map((item) => (
              <li key={item.id} className="widgetItem shoppingWidgetItem">
                <strong>{item.title}</strong>
                {item.quantity || item.note ? (
                  <span className="itemMeta">
                    {[item.quantity, item.note].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </article>

      <FormModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Ny vare"
        confirmation={confirmation}
      >
        <ShoppingListForm
          previousItems={items}
          onSuccess={(message) => setConfirmation(message)}
        />
      </FormModal>
    </>
  );
}
