# NAROK DESIGN

A bilingual English/Amharic catalogue and atelier-enquiry site for Ethiopian traditional clothing, designed for OpenAI Sites and Cloudflare Workers.

## What the site does

- presents ready-made and made-to-order clothing for women, men and children;
- keeps language, saved pieces and the visitor's enquiry selection across routes and browser sessions;
- stores the catalogue, custom-order enquiries, confirmed client orders, storefront settings and newsletter subscriptions in Cloudflare D1;
- rate-limits public submissions and uses honeypot fields to reduce automated spam;
- makes it explicit that the atelier confirms fabric, timing and price directly and that no online payment is taken;
- serves project-owned catalogue artwork through the image-optimization route.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and configure:

- `SITE_URL` — the trusted public origin used for absolute social-preview URLs;
- `ADMIN_EMAILS` — a comma-separated, case-insensitive allowlist for the private atelier workspace;
- `CUSTOM_ORDER_RETENTION_DAYS` — how long completed or declined bespoke enquiries are retained (default `730`, minimum `30`, maximum `3650`).

Set the same values in the hosted Sites environment before publishing. Never commit real administrator addresses or secrets in `.env` files.

## Validation

```bash
npm run lint
npm run build
npm test
```

Run the complete validation sequence with:

```bash
npm run validate
```

This performs strict TypeScript checking, linting, a deployment build, public route checks, and Miniflare-backed D1 integration tests for persistence, account ownership, rate limiting, authorization, settings, and enquiry-to-order conversion.

## Persistence

The logical D1 binding is `DB` in `.openai/hosting.json`. The application initializes its required tables safely at runtime, while the checked-in Drizzle migration documents and provisions the same schema:

- `custom_orders` — atelier enquiries and selected catalogue pieces;
- `newsletter_subscribers` — unique subscriber email addresses;
- `submission_rate_limits` — short-lived hashed visitor counters;
- `catalog_products` — the single live source for the public catalogue;
- `client_orders` — quoted orders converted from atelier enquiries;
- `store_settings` — public store name, announcement, currency and shipping threshold;
- `customer_profiles` — ChatGPT-authenticated customer identities.

Authenticated enquiries are linked to the stable Site user ID, including when the customer supplies a WhatsApp number. Public enquiries remain available without sign-in and can later match an account only when their contact value is the same verified email.

Expired rate-limit rows are removed during submissions and runtime initialization. Completed or declined bespoke enquiries older than `CUSTOM_ORDER_RETENTION_DAYS` are removed during runtime initialization. Active enquiries, confirmed client orders, and newsletter subscriptions are retained until an administrator handles them according to the atelier's operating policy.

After changing `db/schema.ts`, generate and inspect a new migration:

```bash
npm run db:generate
```

## Key project areas

- `app/data/catalog.ts` — shared catalogue and storefront TypeScript contracts;
- `app/components/SiteState.tsx` — device-local language, wishlist and enquiry selection;
- `app/api/` — validated D1-backed submission endpoints;
- `db/` and `drizzle/` — schema, runtime initialization and migrations;
- `worker/index.ts` — Cloudflare Worker and image optimization entry point.

The site intentionally does not implement payment or promise checkout. A commerce provider can be added later after fulfilment, tax, refund and inventory requirements are defined.
