# Family Hub

Family Hub is a playful Next.js and Sanity app for shared family wish lists, movie picks, and future family categories.

## What is included

- A mobile-friendly hub homepage with large navigation cards
- Wish list page with grouped items and a kid-friendly submission form
- Movie page with a recommendation grid and quick-add form
- Next.js route handlers for wishlist and movie submissions
- Embedded Sanity Studio at `/studio` for adult moderation
- Demo fallback data when Sanity environment variables are not set yet

## Stack

- Next.js 16 App Router
- TypeScript
- Plain CSS
- Sanity Studio + `next-sanity`

## Environment setup

Copy `.env.example` to `.env.local` and fill in your Sanity values:

```bash
cp .env.example .env.local
```

Required for live content:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN`

Optional:

- `FAMILY_HUB_SUBMISSION_PASSWORD` to require a shared family password for submissions
- `SANITY_REQUIRE_APPROVAL=true` to make new submissions start as pending

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the app. Run `npm run studio` to launch Sanity Studio locally.

Use `.env.local` in the project root and prefer unquoted values. Sanity Studio reads
`SANITY_STUDIO_*` variables, while the Next app reads `NEXT_PUBLIC_*` variables. Keep them in sync, for example:

```bash
SANITY_STUDIO_PROJECT_ID=p51d587r
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2026-04-10
NEXT_PUBLIC_SANITY_PROJECT_ID=p51d587r
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-10
SANITY_API_WRITE_TOKEN=your_write_token
FAMILY_HUB_SUBMISSION_PASSWORD=chargingHorse
SANITY_REQUIRE_APPROVAL=false
```

If you change env values, restart both `npm run dev` and `npm run studio`.

## Useful scripts

```bash
npm run dev
npm run studio
npm run lint
npm run typecheck
npm run build
```

## Sanity content models

- `familyMember`
- `wishListItem`
- `movieRecommendation`

## Notes

- Without Sanity env vars, the site shows demo content so the UI is still usable.
- Submission endpoints validate basic fields and include a honeypot field for spam resistance.
- Adults manage content through Sanity Studio; children never need Sanity accounts.
