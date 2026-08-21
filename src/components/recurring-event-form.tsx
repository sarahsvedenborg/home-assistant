"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { DEFAULT_EVENT_CATEGORY, EVENT_CATEGORIES } from "@/lib/event-categories";
import { WEEKDAYS } from "@/lib/weekdays";

type RecurringEventFormProps = {
  familyMembers: string[];
  // Called after a successful submit so a parent (e.g. the modal) can show
  // its own confirmation and close. When omitted, an inline message is shown.
  onSuccess?: (message: string) => void;
};

type FormState = {
  title: string;
  familyMemberName: string;
  category: string;
  dayOfWeek: string;
  time: string;
  endTime: string;
  whatToBring: string;
  startDate: string;
  endDate: string;
  website: string;
};

export function RecurringEventForm({ familyMembers, onSuccess }: RecurringEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    familyMemberName: familyMembers[0] || "",
    category: DEFAULT_EVENT_CATEGORY,
    dayOfWeek: WEEKDAYS[0].value,
    time: "",
    endTime: "",
    whatToBring: "",
    startDate: "",
    endDate: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/aktiviteter", {
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

      const successText = result.message || "Aktiviteten er lagt til!";
      setForm({
        title: "",
        familyMemberName: familyMembers[0] || "",
        category: DEFAULT_EVENT_CATEGORY,
        dayOfWeek: WEEKDAYS[0].value,
        time: "",
        endTime: "",
        whatToBring: "",
        startDate: "",
        endDate: "",
        website: "",
      });
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
        <h2>Legg til fast aktivitet</h2>
      </div>

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Aktivitet</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Pianotimer, gym på skolen..."
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
          <span>Ukedag</span>
          <select
            value={form.dayOfWeek}
            onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
            required
          >
            {WEEKDAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="field fieldWide">
          <legend>Type</legend>
          <div className="radioRow">
            {EVENT_CATEGORIES.map((eventCategory) => (
              <label key={eventCategory.value} className="radioOption">
                <input
                  type="radio"
                  name="category"
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

        <label className="field">
          <span>Starttidspunkt (valgfritt)</span>
          <input
            type="text"
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            placeholder="15:00"
            maxLength={40}
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
          />
        </label>

        <label className="field fieldWide">
          <span>Hva må tas med? (valgfritt)</span>
          <textarea
            value={form.whatToBring}
            onChange={(event) =>
              setForm((current) => ({ ...current, whatToBring: event.target.value }))
            }
            placeholder="Gymtøy, noteperm, vannflaske..."
            rows={4}
            maxLength={500}
          />
        </label>

        <label className="field">
          <span>Startdato (valgfritt)</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
          />
        </label>

        <label className="field">
          <span>Sluttdato (valgfritt)</span>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
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
          {isSubmitting ? "Sender..." : "Legg til aktivitet"}
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
