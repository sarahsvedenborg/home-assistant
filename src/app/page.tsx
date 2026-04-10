import Link from "next/link";

import { HubCard } from "@/components/hub-card";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getMovieRecommendations, getSiteMode, getWishListItems } from "@/lib/data";

export default async function Home() {
  const [familyMembers, movies, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getMovieRecommendations(),
    getWishListItems(),
  ]);
  const siteMode = getSiteMode();

  return (
    <main className="shell">
      <SiteHeader current="home" />

      <section className="heroPanel">
        <div className="heroCopy">
          <span className="kicker">Velkommen hjem</span>
          <h1>Et lyst og koselig familieknutepunkt for oensker, filmkvelder og nye ideer.</h1>
          <p>
            Laget for aa vaere enkelt for barna, nyttig for de voksne og fint aa bruke paa mobil,
            nettbrett og laptop.
          </p>

          <div className="heroActions">
            <Link className="buttonPrimary" href="/wishlist#add-wish">
              Legg til et oenske
            </Link>
            <Link className="buttonSecondary" href="/movies#add-movie">
              Legg til en film
            </Link>
          </div>
        </div>

        <div className="heroStats" aria-label="Hovedpunkter i Family Hub">
          <div className="statBubble statBubbleWarm">
            <strong>{familyMembers.length}</strong>
            <span>familiemedlemmer klare til aa bli med</span>
          </div>
          <div className="statBubble statBubbleCool">
            <strong>{wishListItems.length}</strong>
            <span>oensker lagret</span>
          </div>
          <div className="statBubble statBubbleSun">
            <strong>{movies.length}</strong>
            <span>filmforslag samlet</span>
          </div>
          <div className="statusPill">
            <span className="statusDot" aria-hidden="true" />
            {siteMode === "live" ? "Koblet til Sanity" : "Demodata til miljoevariabler er satt"}
          </div>
        </div>
      </section>

      <section className="hubGrid" aria-label="Hovedseksjoner">
        <HubCard
          href="/wishlist"
          icon="🎁"
          title="Oenskeliste"
          description="Samle gaveoensker per person med korte notater og valgfrie lenker."
          stat={`${wishListItems.length} ideer`}
          accentClass="accentWarm"
          ctaLabel="Aapne oenskelisten"
        />
        <HubCard
          href="/movies"
          icon="🎬"
          title="Filmer"
          description="Lagre familiens filmvalg, hold oversikt over hva som er sett, og planlegg neste kosekveld."
          stat={`${movies.filter((movie) => !movie.watched).length} igjen aa se`}
          accentClass="accentCool"
          ctaLabel="Se filmer"
        />
        <article className="hubCard accentFuture">
          <div className="hubCardTop">
            <span className="hubIcon" aria-hidden="true">
              🌟
            </span>
            <span className="hubStat">kommer snart</span>
          </div>
          <h2>Flere familieomraader</h2>
          <p>Her kan turer, middagstips, kalendere og andre enkle kategorier komme senere.</p>
          <span className="buttonSecondary buttonMuted">Klar for fase to</span>
        </article>
      </section>

      <section className="infoStrip">
        <div>
          <span className="kicker">Trygt fra start</span>
          <h2>Ingen komplisert innlogging for barna</h2>
        </div>
        <p>
          Barn sender inn forslag gjennom enkle skjemaer. Voksne beholder redigeringsrettigheter i
          Sanity Studio.
        </p>
      </section>
    </main>
  );
}
