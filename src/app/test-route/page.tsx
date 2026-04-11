export default function TestRoutePage() {
  return (
    <main className="shell">
      <section className="sectionHero accentCoolPanel">
        <div>
          <span className="kicker">Test route</span>
          <h1>Denne siden er offentlig.</h1>
          <p>Alle andre sider i appen krever familiepassord foer de kan aapnes.</p>
        </div>
        <div className="sectionBadge">Ingen innlogging kreves</div>
      </section>
    </main>
  );
}
