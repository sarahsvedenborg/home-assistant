"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { BOARD_COLUMNS } from "@/lib/board";
import type { BoardIssueStatus } from "@/lib/types";

type BoardIssueFormProps = {
  familyMembers: string[];
  onSuccess?: (message: string) => void;
};

type FormState = {
  title: string;
  text: string;
  assigned: string;
  status: BoardIssueStatus;
  website: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  text: "",
  assigned: "",
  status: "todo",
  website: "",
};

export function BoardIssueForm({ familyMembers, onSuccess }: BoardIssueFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/submissions/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFeedback({ kind: "error", text: result.error || "Det fungerte ikke." });
        return;
      }

      const successText = result.message || "Oppgaven er lagt til!";
      setForm(INITIAL_FORM);
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
        <h2>Ny oppgave</h2>
        <p>
          Alle feltene er valgfrie. Nye oppgaver legges i Må gjøres hvis du ikke velger noe annet.
        </p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Tittel (valgfritt)</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            maxLength={120}
            placeholder="Kort tittel"
          />
        </label>

        <label className="field">
          <span>Tildelt (valgfritt)</span>
          <select
            value={form.assigned}
            onChange={(event) =>
              setForm((current) => ({ ...current, assigned: event.target.value }))
            }
          >
            <option value="">Ingen</option>
            {familyMembers.map((member) => (
              <option value={member} key={member}>
                {member}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as BoardIssueStatus,
              }))
            }
          >
            {BOARD_COLUMNS.map((column) => (
              <option value={column.value} key={column.value}>
                {column.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field fieldWide">
          <span>Tekst (valgfritt)</span>
          <textarea
            value={form.text}
            onChange={(event) =>
              setForm((current) => ({ ...current, text: event.target.value }))
            }
            rows={4}
            maxLength={500}
            placeholder="Beskriv oppgaven"
          />
          <small className="smallNote">{form.text.length}/500 tegn</small>
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
          {isSubmitting ? "Lagrer..." : "Legg til oppgave"}
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
