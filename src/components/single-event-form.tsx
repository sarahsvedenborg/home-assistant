"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  DEFAULT_SINGLE_EVENT_CATEGORY,
  SINGLE_EVENT_CATEGORIES,
} from "@/lib/single-event-categories";

type SingleEventFormProps = {
  familyMembers: string[];
  // Called after a successful submit so a parent (e.g. the modal) can show
  // its own confirmation and close. When omitted, an inline message is shown.
  onSuccess?: (message: string) => void;
};

type FormState = {
  title: string;
  familyMemberName: string;
  category: string;
  date: string;
  allDay: boolean;
  time: string;
  endTime: string;
  note: string;
  website: string;
};

function initialState(familyMembers: string[]): FormState {
  return {
    title: "",
    familyMemberName: familyMembers[0] || "",
    category: DEFAULT_SINGLE_EVENT_CATEGORY,
    date: "",
    allDay: false,
    time: "",
    endTime: "",
    note: "",
    website: "",
  };
}

export function SingleEventForm({ familyMembers, onSuccess }: SingleEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>(() => initialState(familyMembers));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/hendelse", {
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

      const successText = result.message || "Hendelsen er lagt til!";
      setForm(initialState(familyMembers));
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
        <h2>Legg til hendelse</h2>
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Hendelse</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Bursdag, tannlege, tur..."
            maxLength={120}
            required
          />
        </label>

        <label className="field">
          <span>Hvem</span>
          <select
            value={form.familyMemberName}
            onChange={(event) =>
              setForm((current) => ({ ...current, familyMemberName: event.target.value }))
            }
            required
          >
            {familyMembers.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Dato</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            required
          />
        </label>

        <fieldset className="field fieldWide">
          <legend>Kategori</legend>
          <div className="radioRow">
            {SINGLE_EVENT_CATEGORIES.map((eventCategory) => (
              <label key={eventCategory.value} className="radioOption">
                <input
                  type="radio"
                  name="single-event-category"
                  value={eventCategory.value}
                  checked={form.category === eventCategory.value}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                />
                <span>{eventCategory.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field fieldWide checkboxField">
          <input
            className="checkboxInput"
            type="checkbox"
            checked={form.allDay}
            onChange={(event) =>
              setForm((current) => ({ ...current, allDay: event.target.checked }))
            }
          />
          <span>Hele dagen</span>
        </label>

        <label className="field">
          <span>Starttidspunkt (valgfritt)</span>
          <input
            type="text"
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            placeholder="13:00"
            maxLength={40}
            disabled={form.allDay}
          />
        </label>

        <label className="field">
          <span>Sluttidspunkt (valgfritt)</span>
          <input
            type="text"
            value={form.endTime}
            onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
            placeholder="16:00"
            maxLength={40}
            disabled={form.allDay}
          />
        </label>

        <label className="field fieldWide">
          <span>Notat (valgfritt)</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="Adresse, hva som må tas med, annet..."
            rows={4}
            maxLength={500}
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
          {isSubmitting ? "Sender..." : "Legg til hendelse"}
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
