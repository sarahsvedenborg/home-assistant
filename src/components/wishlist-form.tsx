"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type WishlistFormProps = {
  familyMembers: string[];
  selectedMemberName?: string;
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

export function WishlistForm({ familyMembers, selectedMemberName }: WishlistFormProps) {
  const router = useRouter();
  const defaultMember = selectedMemberName || familyMembers[0] || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    submittedByName: defaultMember,
    title: "",
    link: "",
    description: "",
    password: "",
    website: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      submittedByName: defaultMember,
    }));
  }, [defaultMember]);

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
        setMessage({ kind: "error", text: result.error || "Det fungerte ikke." });
        return;
      }

      setMessage({ kind: "success", text: result.message || "Ønsket er lagt til!" });
      setForm({
        submittedByName: defaultMember,
        title: "",
        link: "",
        description: "",
        password: "",
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
        <span className="kicker">Legg til et ønske</span>
        <h2>
          {selectedMemberName
            ? `Legg til et ønske for ${selectedMemberName}`
            : "Del en ide med bare noen få trykk"}
        </h2>
        <p>
          {selectedMemberName
            ? "Skjemaet lagrer ønsket direkte på riktig person."
            : "Perfekt for gaver, opplevelser eller små hint til senere."}
        </p>
      </div>

      <div className="formGrid">
        {selectedMemberName ? (
          <div className="field fieldWide">
            <span>Legges til for</span>
            <div className="lockedMember">{selectedMemberName}</div>
          </div>
        ) : (
          <label className="field">
            <span>Navnet ditt</span>
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
        )}

        <label className="field fieldWide">
          <span>Navn på ønsket</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Lego, sparkesykkel, hobbysett..."
            maxLength={100}
            required
          />
        </label>

        <label className="field fieldWide">
          <span>Lenke (valgfritt)</span>
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
            placeholder="https://"
          />
        </label>

        <label className="field fieldWide">
          <span>Notater (valgfritt)</span>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Favorittfarge, stoerrelse eller hvorfor det virker fint"
            maxLength={280}
            rows={4}
          />
        </label>

        <label className="field fieldWide">
          <span>Familiepassord (valgfritt)</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Bare hvis en voksen har gitt deg det"
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
          {isSubmitting ? "Sender..." : "Legg til forslag"}
        </button>
        <p className="smallNote">En voksen kan rydde opp eller godkjenne forslag i Sanity Studio.</p>
      </div>

      {message ? (
        <p className={messageClassNames[message.kind]} aria-live="polite">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
