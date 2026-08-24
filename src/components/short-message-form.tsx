"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ShortMessageFormProps = {
  familyMembers: string[];
  onSuccess?: (message: string) => void;
};

type FormState = {
  sender: string;
  recipients: string[];
  text: string;
  website: string;
};

export function ShortMessageForm({ familyMembers, onSuccess }: ShortMessageFormProps) {
  const router = useRouter();
  const recipientOptions = [
    { value: "all", label: "Alle" },
    { value: "parents", label: "Foreldre" },
    ...familyMembers.map((member) => ({ value: member, label: member })),
  ];
  const [form, setForm] = useState<FormState>({
    sender: "",
    recipients: [],
    text: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  function toggleRecipient(value: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      recipients: checked
        ? [...current.recipients, value]
        : current.recipients.filter((recipient) => recipient !== value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/submissions/meldinger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFeedback({ kind: "error", text: result.error || "Det fungerte ikke." });
        return;
      }

      const successText = result.message || "Meldingen er lagt til!";
      setForm({ sender: "", recipients: [], text: "", website: "" });
      router.refresh();

      if (onSuccess) {
        onSuccess(successText);
      } else {
        setFeedback({ kind: "success", text: successText });
      }
    } catch {
      setFeedback({ kind: "error", text: "Noe gikk galt. Prøv igjen." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
        <h2>Ny melding</h2>
        <p>Skriv en kort beskjed til én eller flere i familien.</p>
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Avsender (valgfritt)</span>
          <select
            value={form.sender}
            onChange={(event) =>
              setForm((current) => ({ ...current, sender: event.target.value }))
            }
          >
            <option value="">Ingen avsender</option>
            {recipientOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="field fieldWide checkboxFieldset">
          <legend>Mottakere (valgfritt)</legend>
          <div className="checkboxGrid messageRecipientGrid">
            {recipientOptions.map((option) => {
              const checked = form.recipients.includes(option.value);

              return (
                <label key={option.value} className="checkboxOption">
                  <input
                    className="checkboxInput"
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleRecipient(option.value, event.target.checked)}
                  />
                  <span className={checked ? "checkboxLabel checkboxLabelChecked" : "checkboxLabel"}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field fieldWide">
          <span>Melding</span>
          <textarea
            value={form.text}
            onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
            placeholder="Skriv en kort beskjed..."
            rows={3}
            maxLength={240}
            required
          />
          <small className="smallNote">{form.text.length}/240 tegn</small>
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
          {isSubmitting ? "Sender..." : "Send melding"}
        </button>
      </div>

      {feedback ? (
        <p
          className={
            feedback.kind === "error"
              ? "feedback feedbackError"
              : "feedback feedbackSuccess"
          }
          aria-live="polite"
        >
          {feedback.text}
        </p>
      ) : null}
    </form>
  );
}
