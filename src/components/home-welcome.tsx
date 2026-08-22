import Link from "next/link";

export function HomeWelcome({ dateLabel }: { dateLabel: string }) {
  return (
    <section className="homeWelcome accentWarm" aria-labelledby="home-welcome-title">
      <div>
        <span className="kicker">Velkommen hjem</span>
        <h1 id="home-welcome-title">Familiens oversikt</h1>
        <span className="itemMeta">{dateLabel}</span>
      </div>
      <div className="heroActions">
        <Link className="buttonPrimary" href="/#add-event">
          Legg til hendelse
        </Link>
        <Link className="buttonSecondary" href="/onskeliste#add-wish">
          Legg til et ønske
        </Link>
      </div>
    </section>
  );
}
