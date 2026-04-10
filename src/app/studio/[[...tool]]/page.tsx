import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Family Hub Studio",
  referrer: "same-origin",
  robots: "noindex",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioPage() {
  return (
    <main className="shell">
      <SiteHeader current="home" />

      <section className="sectionHero accentFuture">
        <div>
          <span className="kicker">Studio for voksne</span>
          <h1>Sanity er satt opp og klart for moderering av de voksne.</h1>
          <p>
            Skjemaene og CLI-oppsettet ligger i dette repoet. Start Studio lokalt etter at du har
            lagt inn miljøvariablene for Sanity.
          </p>
        </div>
        <div className="sectionBadge">Sanity Studio kjører med sin egen utviklingsserver</div>
      </section>

      <section className="contentGrid">
        <article className="listPanel">
          <div className="panelHeading">
            <h2>Start Studio</h2>
            <p>Kjør kommandoen under for å åpne modereringsgrensesnittet for de voksne.</p>
          </div>

          <div className="commandCard">
            <code>npm run studio</code>
          </div>

          <div className="noteStack">
            <p>
              Legg inn `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` og
              `SANITY_API_WRITE_TOKEN` i `.env.local` forst.
            </p>
            <p>
              Studio inneholder dokumenttypene `familyMember`, `wishListItem` og
              `movieRecommendation` for moderering.
            </p>
          </div>
        </article>

        <article className="formPanel">
          <div className="formIntro">
            <span className="kicker">Verktøy for voksne</span>
            <h2>Administrer familiehuben på en trygg måte</h2>
            <p>Rediger, godkjenn, fjern og organiser innhold uten å gi barna tilgang til backend.</p>
          </div>

          <div className="noteStack">
            <p>- Gå gjennom ventende forslag når `SANITY_REQUIRE_APPROVAL=true`</p>
            <p>- Oppdater sett-status, notater, lenker, plakater og familiemedlemmer</p>
            <p>- Hold navnelistene for barna oppdatert fra ett felles sted</p>
          </div>

          <Link href="/" className="buttonSecondary">
            Tilbake til Family Hub
          </Link>
        </article>
      </section>
    </main>
  );
}
