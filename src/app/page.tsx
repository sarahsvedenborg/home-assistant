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
          <span className="kicker">Welcome home</span>
          <h1>A bright little family hub for wishes, movie nights, and new ideas.</h1>
          <p>
            Built to be easy for kids, useful for grown-ups, and friendly on phones, tablets,
            and laptops.
          </p>

          <div className="heroActions">
            <Link className="buttonPrimary" href="/wishlist#add-wish">
              Add a wish
            </Link>
            <Link className="buttonSecondary" href="/movies#add-movie">
              Add a movie
            </Link>
          </div>
        </div>

        <div className="heroStats" aria-label="Family Hub highlights">
          <div className="statBubble statBubbleWarm">
            <strong>{familyMembers.length}</strong>
            <span>family members ready to join in</span>
          </div>
          <div className="statBubble statBubbleCool">
            <strong>{wishListItems.length}</strong>
            <span>wish list ideas saved</span>
          </div>
          <div className="statBubble statBubbleSun">
            <strong>{movies.length}</strong>
            <span>movie night picks collected</span>
          </div>
          <div className="statusPill">
            <span className="statusDot" aria-hidden="true" />
            {siteMode === "live" ? "Connected to Sanity" : "Demo data until env is set"}
          </div>
        </div>
      </section>

      <section className="hubGrid" aria-label="Main sections">
        <HubCard
          href="/wishlist"
          icon="🎁"
          title="Wish List"
          description="Group gift ideas by person with quick notes and optional links."
          stat={`${wishListItems.length} ideas`}
          accentClass="accentWarm"
          ctaLabel="Open wish list"
        />
        <HubCard
          href="/movies"
          icon="🎬"
          title="Movies"
          description="Save family picks, track watched status, and plan the next cozy night in."
          stat={`${movies.filter((movie) => !movie.watched).length} to watch`}
          accentClass="accentCool"
          ctaLabel="Browse movies"
        />
        <article className="hubCard accentFuture">
          <div className="hubCardTop">
            <span className="hubIcon" aria-hidden="true">
              🌟
            </span>
            <span className="hubStat">coming soon</span>
          </div>
          <h2>More family spaces</h2>
          <p>Trips, meal ideas, calendars, and other easy-to-share categories can plug in here.</p>
          <span className="buttonSecondary buttonMuted">Ready for phase two</span>
        </article>
      </section>

      <section className="infoStrip">
        <div>
          <span className="kicker">Safe by design</span>
          <h2>No complex login flow for kids</h2>
        </div>
        <p>
          Children submit through simple forms. Adults keep editing power inside Sanity Studio.
        </p>
      </section>
    </main>
  );
}
