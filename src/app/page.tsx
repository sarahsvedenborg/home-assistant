import Link from "next/link";

import { HubCard } from "@/components/hub-card";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getMovieRecommendations, getRecipes, getShoppingList, getWishListItems } from "@/lib/data";

export default async function Home() {
  const [familyMembers, movies, recipes, shoppingList, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getMovieRecommendations(),
    getRecipes(),
    getShoppingList(),
    getWishListItems(),
  ]);
  return (
    <main className="shell">
      <SiteHeader current="home" />

      <section className="heroPanel">
        <div className="heroCopy">
          <span className="kicker">Velkommen hjem</span>
{/*           <h1>Et lyst og koselig familieknutepunkt for ønsker, filmkvelder og nye ideer.</h1> */}
          <h1>Et knutepunkt for felles info for familien.</h1>
          <p>
           {/*  Laget for å være enkelt for barna, nyttig for de voksne og fint å bruke på mobil,
            nettbrett og laptop. */}
          </p>

          <div className="heroActions">
            <Link className="buttonPrimary" href="/onskeliste#add-wish">
              Legg til et ønske
            </Link>
            <Link className="buttonSecondary" href="/movies#add-movie">
              Legg til en film
            </Link>
          </div>
        </div>

        <div className="heroStats" aria-label="Hovedpunkter i Family Hub">
           <div className="statBubble statBubbleCool">
            <strong>{shoppingList.items.filter((item) => !item.checked).length}</strong>
            <span>varer må kjøpes</span>
          </div>
            <div className="statBubble statBubbleSun">
            <strong>{movies.length}</strong>
            <span>filmforslag</span>
          </div>
        
          <div className="statBubble statBubbleCool">
            <strong>{wishListItems.length}</strong>
            <span>ønsker</span>
          </div>
            <div className="statBubble statBubbleWarm">
            <strong>{familyMembers.length}</strong>
            <span>familiemedlemmer</span>
          </div>
        
        {/*   <div className="statusPill">
            <span className="statusDot" aria-hidden="true" />
            {siteMode === "live" ? "Koblet til Sanity" : "Demodata til miljøvariabler er satt"}
          </div> */}
        </div>
      </section>

      <section className="hubGrid" aria-label="Hovedseksjoner">
        <HubCard
          href="/onskeliste"
          icon="🎁"
          title="Ønskeliste"
          description="Samling av gaveønsker per familiemedlem."
          stat={`${wishListItems.length} idéer`}
          accentClass="accentWarm"
          ctaLabel="Åpne ønskelisten"
        />
        <HubCard
          href="/handleliste"
          icon="🛒"
          title="Handleliste"
          description="Varer vi trenger å kjøpe."
          stat={`${shoppingList.items.filter((item) => !item.checked).length} varer`}
          accentClass="accentFuture"
          ctaLabel="Åpne handlelisten"
        />
        <HubCard
          href="/oppskrifter"
          icon="🍲"
          title="Oppskrifter"
          description="Samling av oppskrifter med lenker og notater."
          stat={`${recipes.length} oppskrifter`}
          accentClass="accentCool"
          ctaLabel="Se oppskrifter"
        />
        <HubCard
          href="/movies"
          icon="🎬"
          title="Filmer"
          description="Oversikt over filmforlag og hva som er sett og ikke."
          stat={`${movies.filter((movie) => !movie.watched).length} usett`}
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
          <h2>Flere familieområder</h2>
          <p>Her kan turer, middagstips, kalendere og andre enkle kategorier komme senere.</p>
          <span className="buttonSecondary buttonMuted">Klar for fase to</span>
        </article>
      </section>

  {/*     <section className="infoStrip">
        <div>
          <span className="kicker">Trygt fra start</span>
          <h2>Ingen komplisert innlogging for barna</h2>
        </div>
        <p>
          Barn sender inn forslag gjennom enkle skjemaer. Voksne beholder redigeringsrettigheter i
          Sanity Studio.
        </p>
      </section> */}
    </main>
  );
}
