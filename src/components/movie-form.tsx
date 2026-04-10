"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type MovieFormProps = {
  familyMembers: string[];
};

type FormState = {
  suggestedByName: string;
  title: string;
  link: string;
  posterUrl: string;
  password: string;
  website: string;
};

const messageClassNames = {
  error: "feedback feedbackError",
  success: "feedback feedbackSuccess",
};

export function MovieForm({ familyMembers }: MovieFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    suggestedByName: familyMembers[0] || "",
    title: "",
    link: "",
    posterUrl: "",
    password: "",
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
        setMessage({ kind: "error", text: result.error || "That did not work." });
        return;
      }

      setMessage({ kind: "success", text: result.message || "Movie added!" });
      setForm({
        suggestedByName: familyMembers[0] || "",
        title: "",
        link: "",
        posterUrl: "",
        password: "",
        website: "",
      });
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formIntro">
        <span className="kicker">Add a movie</span>
        <h2>Save the next family movie night pick</h2>
        <p>Share favorites, new finds, or the one everyone keeps talking about.</p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Suggested by</span>
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
        </label>

        <label className="field fieldWide">
          <span>Movie title</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="A fun comedy, adventure, or favorite classic"
            maxLength={120}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Movie link (optional)</span>
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
            placeholder="https://"
          />
        </label>

        <label className="field fieldWide">
          <span>Poster image URL (optional)</span>
          <input
            type="url"
            value={form.posterUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, posterUrl: event.target.value }))
            }
            placeholder="https://image.example/poster.jpg"
          />
        </label>

        <label className="field fieldWide">
          <span>Family password (optional)</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Only if a grown-up gave you one"
          />
        </label>

        <label className="srOnly" aria-hidden="true">
          Leave this field empty
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
          {isSubmitting ? "Sending..." : "Add movie"}
        </button>
        <p className="smallNote">New picks start as unwatched and can be managed in the studio.</p>
      </div>

      {message ? (
        <p className={messageClassNames[message.kind]} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
