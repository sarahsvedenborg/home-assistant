"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type WishlistFormProps = {
  familyMembers: string[];
};

type FormState = {
  submittedByName: string;
  title: string;
  link: string;
  description: string;
  password: string;
  website: string;
};

const messageClassNames = {
  error: "feedback feedbackError",
  success: "feedback feedbackSuccess",
};

export function WishlistForm({ familyMembers }: WishlistFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    submittedByName: familyMembers[0] || "",
    title: "",
    link: "",
    description: "",
    password: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/submissions/wishlist", {
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

      setMessage({ kind: "success", text: result.message || "Wish added!" });
      setForm({
        submittedByName: familyMembers[0] || "",
        title: "",
        link: "",
        description: "",
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
        <span className="kicker">Add a wish</span>
        <h2>Share an idea in a few taps</h2>
        <p>Perfect for presents, experiences, or tiny hints for later.</p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Your name</span>
          <select
            value={form.submittedByName}
            onChange={(event) =>
              setForm((current) => ({ ...current, submittedByName: event.target.value }))
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
          <span>Item name</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Lego set, scooter, craft kit..."
            maxLength={100}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Link (optional)</span>
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
            placeholder="https://"
          />
        </label>

        <label className="field fieldWide">
          <span>Notes (optional)</span>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Favorite color, size, or why it feels fun"
            maxLength={280}
            rows={4}
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
          {isSubmitting ? "Sending..." : "Add suggestion"}
        </button>
        <p className="smallNote">A grown-up can clean up or approve entries in Sanity Studio.</p>
      </div>

      {message ? (
        <p className={messageClassNames[message.kind]} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
