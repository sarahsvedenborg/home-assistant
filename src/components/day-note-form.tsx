"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type DayNoteFormProps = {
  initialDate: string;
  onSuccess?: (message: string) => void;
};

export function DayNoteForm({ initialDate, onSuccess }: DayNoteFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: initialDate,
    text: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/submissions/dagsnotat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFeedback(result.error || "Det fungerte ikke.");
        return;
      }

      const successText = result.message || "Dagsnotatet er lagt til!";
      setForm({ date: initialDate, text: "", website: "" });
      router.refresh();

      if (onSuccess) {
        onSuccess(successText);
      }
    } catch {
      setFeedback("Noe gikk galt. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
        <h2>Nytt dagsnotat</h2>
        <p>Notatet vises nederst på den valgte dagen i kalenderen.</p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Dato</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((current) => ({ ...current, date: event.target.value }))
            }
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Dagsnotat</span>
          <input
            type="text"
            value={form.text}
            onChange={(event) =>
              setForm((current) => ({ ...current, text: event.target.value }))
            }
            maxLength={200}
            placeholder="Kort notat for dagen..."
            required
          />
          <small className="smallNote">{form.text.length}/200 tegn</small>
        </label>

        <label className="srOnly" aria-hidden="true">
          La dette feltet stå tomt
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(event) =>
              setForm((current) => ({ ...current, website: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="formActions">
        <button className="buttonPrimary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Lagrer..." : "Legg til notat"}
        </button>
      </div>

      {feedback ? (
        <p className="feedback feedbackError" role="alert">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
