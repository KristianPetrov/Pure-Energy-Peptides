# Pure Energy Peptides

An elegant ecommerce storefront for research peptides, built with Next.js 16
(App Router), React 19, Tailwind CSS v4, Drizzle ORM on Neon Postgres,
Auth.js v5, and Resend.

All products are presented as **For Research Use Only** — not for human or
veterinary use.

## Features

- Public catalog grouped by category, product detail pages, and a 3D
  energy-flow hero animation.
- Client-side cart persisted in `localStorage` with a slide-out drawer.
- Checkout with shipping method, manual Zelle/Venmo payment preference,
  referral codes, and a required Research Use Only acknowledgement.
- Orders created as `pending_payment`; admins mark paid, ship with tracking,
  or cancel (with automatic restocking).
- Customer accounts with verified email sign-in and order history, plus
  guest checkout and guest order tracking.
- Admin dashboards for orders, inventory, referral partners/codes, and
  analytics.
- Transactional emails via Resend.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm db:push                 # create schema on Neon
pnpm db:seed                 # seed catalog + admin account
pnpm dev
```

Required environment variables are documented in `.env.example`. The app
builds and renders without a database, but catalog, checkout, auth, and admin
features need `DATABASE_URL` (Neon Postgres) and `AUTH_SECRET`. Emails no-op
with a console warning unless `RESEND_API_KEY` is set.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push Drizzle schema to the database |
| `pnpm db:generate` / `pnpm db:migrate` | Generate / run SQL migrations |
| `pnpm db:seed` | Seed products and the admin account |
| `node scripts/generate-product-images.mjs` | Regenerate product vial SVGs |

## Structure

- `app/` — routes (storefront, checkout, order, account, auth, admin) and
  server actions in `app/actions/`.
- `components/` — shared UI (header, footer, cart, checkout form, energy
  flow animation).
- `db/` — Drizzle schema, lazy Neon client, and seed script.
- `lib/` — data access, emails, referral/shipping/carrier helpers.
- `auth.config.ts` / `auth.ts` / `proxy.ts` — edge-safe Auth.js split and
  route protection for `/admin` and `/account`.
