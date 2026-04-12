"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type RecipeFormState = {
  title: string;
  url: string;
  content: string;
  website: string;
};

export function RecipeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<RecipeFormState>({
    title: "",
    url: "",
    content: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/oppskrifter", {
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

      setMessage({ kind: "success", text: result.message || "Oppskriften er lagt til!" });
      setForm({
        title: "",
        url: "",
        content: "",
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
        <h2>Legg til oppskrift</h2>
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Tittel</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Kremet pasta, enkel suppe..."
            maxLength={120}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>URL</span>
          <input
            type="url"
            value={form.url}
            onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
            placeholder="https://"
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Innhold</span>
          <textarea
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            placeholder="Skriv ingredienser og fremgangsmaate her. Ett nytt avsnitt per linje."
            rows={8}
            required
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
          {isSubmitting ? "Sender..." : "Legg til oppskrift"}
        </button>
      </div>

      {message ? (
        <p className={message.kind === "error" ? "feedback feedbackError" : "feedback feedbackSuccess"} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
