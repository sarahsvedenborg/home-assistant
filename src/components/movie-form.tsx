"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  MOVIE_AUDIENCES,
  type MovieAudience,
} from "@/lib/movie-audiences";

type MovieFormProps = {
  familyMembers: string[];
  // Called after a successful submit so a parent (e.g. the modal) can show
  // its own confirmation and close. When omitted, an inline message is shown.
  onSuccess?: (message: string) => void;
};

type FormState = {
  suggestedByName: string;
  suitableFor: MovieAudience | "";
  title: string;
  link: string;
  website: string;
};

const messageClassNames = {
  error: "feedback feedbackError",
  success: "feedback feedbackSuccess",
};

export function MovieForm({ familyMembers, onSuccess }: MovieFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    suggestedByName: familyMembers[0] || "",
    suitableFor: "",
    title: "",
    link: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/movies", {
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

      const successText = result.message || "Filmen er lagt til!";
      setForm({
        suggestedByName: familyMembers[0] || "",
        suitableFor: "",
        title: "",
        link: "",
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
      {/*   <span className="kicker">Legg til en film</span> */}
        <h2>Legg til filmforslag</h2>
{/*         <p>Del favoritter, nye funn eller filmen alle snakker om.</p> */}
      </div>

      <div className="formGrid">
      {/*   <label className="field">
          <span>Foreslatt av</span>
          <select
            value={form.suggestedByName}
            onChange={(event) =>
              setForm((current) => ({ ...current, suggestedByName: event.target.value }))
            }
            required
          >
            {familyMembers.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </label> */}

        <label className="field fieldWide">
          <span>Filmtittel</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="En morsom komedie, et eventyr eller en klassiker"
            maxLength={120}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Filmlenke (valgfritt)</span>
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
            placeholder="https://"
          />
        </label>

        <fieldset className="field fieldWide checkboxFieldset">
          <legend>Passer for</legend>
          <div className="checkboxGrid eventParticipantGrid">
            {MOVIE_AUDIENCES.map((audience) => {
              const checked = form.suitableFor === audience.value;

              return (
                <label className="checkboxOption" key={audience.value}>
                  <input
                    className="radioInput"
                    type="radio"
                    name="suitable-for"
                    value={audience.value}
                    checked={checked}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        suitableFor: audience.value,
                      }))
                    }
                    required
                  />
                  <span
                    className={
                      checked ? "checkboxLabel checkboxLabelChecked" : "checkboxLabel"
                    }
                  >
                    {audience.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

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
          {isSubmitting ? "Sender..." : "Legg til film"}
        </button>
      </div>

      {message ? (
        <p className={messageClassNames[message.kind]} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
