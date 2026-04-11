"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import type { ShoppingListEntry } from "@/lib/types";

type ShoppingListFormProps = {
  familyMembers: string[];
  previousItems: ShoppingListEntry[];
};

type FormState = {
  title: string;
  quantity: string;
  note: string;
  addedBy: string;
  website: string;
};

export function ShoppingListForm({ familyMembers, previousItems }: ShoppingListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    quantity: "",
    note: "",
    addedBy: familyMembers[0] || "",
    website: "",
  });

  const suggestedItems = useMemo(() => {
    return Array.from(
      new Map(
        previousItems
          .slice()
          .reverse()
          .map((item) => [item.title.trim().toLowerCase(), item]),
      ).values(),
    );
  }, [previousItems]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/handleliste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setMessage({ kind: "error", text: result.error || "Det fungerte ikke." });
        return;
      }

      setMessage({ kind: "success", text: result.message || "Varen er lagt til!" });
      setForm({
        title: "",
        quantity: "",
        note: "",
        addedBy: familyMembers[0] || "",
        website: "",
      });
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "Noe gikk galt. Proev igjen." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
     {/*    <span className="kicker">Legg til vare</span> */}
        <h2>Legg til vare</h2>
{/*         <p>Legg inn hva som mangler, hvor mye dere trenger og et kort notat hvis det hjelper.</p> */}
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Vare</span>
          <input
            type="text"
            list="shopping-item-suggestions"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Brod, melk, pasta..."
            maxLength={100}
            required
          />
          <datalist id="shopping-item-suggestions">
            {suggestedItems.map((item) => (
              <option key={item.id} value={item.title} />
            ))}
          </datalist>
          {suggestedItems.length > 0 ? (
            <p className="smallNote">Begynn aa skrive for aa velge blant varer dere har lagt til tidligere.</p>
          ) : null}
        </label>

        <label className="field">
          <span>Mengde (valgfritt)</span>
          <input
            type="text"
            value={form.quantity}
            onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            placeholder="2 stk, 1 pose"
            maxLength={60}
          />
        </label>

      {/*   <label className="field">
          <span>Lagt til av</span>
          <select
            value={form.addedBy}
            onChange={(event) => setForm((current) => ({ ...current, addedBy: event.target.value }))}
          >
            {familyMembers.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </label> */}

        <label className="field fieldWide">
          <span>Kommentar (valgfritt)</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="For eksempel type, merke eller noe annet viktig"
            rows={4}
            maxLength={200}
          />
        </label>

        <label className="srOnly" aria-hidden="true">
          La dette feltet staa tomt
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          />
        </label>
      </div>

      <div className="formActions">
        <button className="buttonPrimary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sender..." : "Legg til i handlelisten"}
        </button>
{/*         <p className="smallNote">Listen samles i ett Sanity-dokument som voksne kan rydde i.</p> */}
      </div>

      {message ? (
        <p className={message.kind === "error" ? "feedback feedbackError" : "feedback feedbackSuccess"} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
