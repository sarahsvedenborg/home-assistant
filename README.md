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

Open `http://localhost:3000` for the app and `http://localhost:3000/studio` for the Sanity Studio.

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
