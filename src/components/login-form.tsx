"use client";

import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const hasError = searchParams.get("error") === "1";

  return (
    <form className="formPanel loginPanel" method="post" action="/api/auth/login">
      <div className="formIntro">
        <span className="kicker">Familiepassord</span>
        <h2>Logg inn for å åpne Family Hub</h2>
        <p>Passordet lagres trygt i en informasjonskapsel i seks måneder.</p>
      </div>

      <input type="hidden" name="next" value={next} />

      <div className="formGrid">
        <label className="field fieldWide">
          <span>Passord</span>
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
      </div>

      <div className="formActions">
        <button className="buttonPrimary" type="submit">
          Fortsett
        </button>
      </div>

      {hasError ? (
        <p className="feedback feedbackError">Passordet stemte ikke. Proev igjen.</p>
      ) : null}
    </form>
  );
}
