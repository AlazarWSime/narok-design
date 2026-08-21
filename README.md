# NAROK DESIGN

A bilingual English/Amharic catalogue and atelier-enquiry site for Ethiopian traditional clothing, designed for OpenAI Sites and Cloudflare Workers.

## What the site does

- presents ready-made and made-to-order clothing for women, men and children;
- keeps language, saved pieces and the visitor's enquiry selection across routes and browser sessions;
- stores custom-order enquiries and newsletter subscriptions in Cloudflare D1;
- rate-limits public submissions and uses honeypot fields to reduce automated spam;
- makes it explicit that the atelier confirms fabric, timing and price directly and that no online payment is taken;
- serves project-owned catalogue artwork through the image-optimization route.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` when testing absolute social metadata on a custom origin.

## Validation

```bash
npm run lint
npm run build
npm test
```

`npm test` builds the deployment worker and verifies all five public routes, social metadata, API validation, owned image references and the D1 binding.

## Persistence

The logical D1 binding is `DB` in `.openai/hosting.json`. The application initializes its required tables safely at runtime, while the checked-in Drizzle migration documents and provisions the same schema:

- `custom_orders` — atelier enquiries and selected catalogue pieces;
- `newsletter_subscribers` — unique subscriber email addresses;
- `submission_rate_limits` — short-lived hashed visitor counters.

After changing `db/schema.ts`, generate and inspect a new migration:

```bash
npm run db:generate
```

## Key project areas

- `app/data/catalog.ts` — canonical product catalogue;
- `app/components/SiteState.tsx` — device-local language, wishlist and enquiry selection;
- `app/api/` — validated D1-backed submission endpoints;
- `db/` and `drizzle/` — schema, runtime initialization and migrations;
- `worker/index.ts` — Cloudflare Worker and image optimization entry point.

The site intentionally does not implement payment or promise checkout. A commerce provider can be added later after fulfilment, tax, refund and inventory requirements are defined.
