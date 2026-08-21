"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type FeatureSuggestionFormProps = {
  // Called after a successful submit so a parent (e.g. the modal) can show
  // its own confirmation and close. When omitted, an inline message is shown.
  onSuccess?: (message: string) => void;
};

type FormState = {
  title: string;
  text: string;
  website: string;
};

export function FeatureSuggestionForm({ onSuccess }: FeatureSuggestionFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    text: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/forslag", {
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

      const successText = result.message || "Takk for forslaget!";
      setForm({ title: "", text: "", website: "" });
      router.refresh();

      if (onSuccess) {
        onSuccess(successText);
      } else {
        setMessage({ kind: "success", text: successText });
      }
    } catch {
      setMessage({ kind: "error", text: "Noe gikk galt. Proev igjen." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
        <h2>Foreslå en ny funksjon</h2>
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Tittel</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Ukemeny, bursdagskalender..."
            maxLength={120}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Beskrivelse</span>
          <textarea
            value={form.text}
            onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
            placeholder="Fortell kort hva funksjonen skal gjøre og hvorfor den er nyttig."
            rows={5}
            maxLength={1000}
            required
          />
        </label>

        <label className="srOnly" aria-hidden="true">
          La dette feltet stå tomt
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
          {isSubmitting ? "Sender..." : "Send forslag"}
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
