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
          <span className="kicker">Grown-up studio</span>
          <h1>Sanity is configured and ready for adult moderation.</h1>
          <p>
            The schema and CLI setup are in this repo. Start the Studio locally after adding your
            Sanity environment variables.
          </p>
        </div>
        <div className="sectionBadge">Sanity Studio runs with its own dev server</div>
      </section>

      <section className="contentGrid">
        <article className="listPanel">
          <div className="panelHeading">
            <h2>Start the Studio</h2>
            <p>Run the command below to open the moderation interface for adults.</p>
          </div>

          <div className="commandCard">
            <code>npm run studio</code>
          </div>

          <div className="noteStack">
            <p>
              Add `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and
              `SANITY_API_WRITE_TOKEN` to `.env.local` first.
            </p>
            <p>
              The Studio includes `familyMember`, `wishListItem`, and `movieRecommendation`
              document types for moderation.
            </p>
          </div>
        </article>

        <article className="formPanel">
          <div className="formIntro">
            <span className="kicker">Adult controls</span>
            <h2>Manage the family hub safely</h2>
            <p>Edit, approve, remove, or organize content without giving children backend access.</p>
          </div>

          <div className="noteStack">
            <p>- Review pending suggestions when `SANITY_REQUIRE_APPROVAL=true`</p>
            <p>- Update watched status, notes, links, posters, and family members</p>
            <p>- Keep kid-friendly dropdown options accurate from one source of truth</p>
          </div>

          <Link href="/" className="buttonSecondary">
            Back to Family Hub
          </Link>
        </article>
      </section>
    </main>
  );
}
