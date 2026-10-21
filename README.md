# RMAX Solutions

Full-stack storefront for the RMAX sanitary-napkin incinerator range, built from the design references in [`.context/`](.context). Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, MongoDB + Mongoose, Auth.js.

- Design tokens and screen map: [`.context/DESIGN_SYSTEM.md`](.context/DESIGN_SYSTEM.md)
- Data model: [`.context/DATA_MODEL.md`](.context/DATA_MODEL.md)

## Requirements

- Node.js 20.9+ (developed on Node 24)
- A MongoDB database — local install, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas)

## Setup

```bash
npm install --legacy-peer-deps   # @hookform/resolvers declares conflicting *optional* peers
cp .env.example .env.local       # then fill in the values below
npm run seed                     # loads the content shown in the designs
npm run dev                      # http://localhost:3000
```

`npm run build` needs the database reachable and **seeded**, because catalogue, FAQ and policy content is prerendered from MongoDB.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/rmax` |
| `AUTH_SECRET` | yes | Signs Auth.js session cookies. Generate with `npx auth secret` or `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata, sitemap and Open Graph (default `http://localhost:3000`) |
| `SEED_DEMO_PASSWORD` | for the demo account | Password for the seeded `facilities@example.org` account (min 8 chars). If unset, the demo account and order are skipped. **Quote the value if it contains `#`.** |

Only `.env.example` is committed. `.env*` files are git-ignored.

### Running without MongoDB

The site starts and every page renders even when MongoDB is unreachable. Connections fail fast (about 2.5 s), a warning is logged once, and:

- **Still works:** Compare Models, Help & FAQs, the three policy pages, the footer and all static layouts — served from the built-in seed content in `src/data/seed.ts`, which is the same content `npm run seed` loads.
- **Disabled, with a clear message:** adding to cart, checkout, quote requests, sign-up, login, forgot password and everything under `/account`. The API answers `503 { success: false, error: { message: "The database is not connected right now…" } }`.
- The cart shows as empty and the navbar shows "Login".

When the database comes back, the app reconnects on its own (retry after 10 s). Content cached from MongoDB for up to an hour is refreshed on the next cache expiry or restart. I verified this against `next dev` with nothing listening on port 27017; `npm run build` has only been verified against a seeded database.

### No MongoDB or Docker installed?

```bash
npm run dev:db    # throw-away in-memory MongoDB on 127.0.0.1:27017 (data is lost on exit)
npm run seed      # in a second terminal
```

## Seeding

`npm run seed` is idempotent: it replaces the products, FAQs and policy pages, and recreates the demo account (Asha Rao, Sample Campus) and demo order `RMAX-DEMO-001` (08 Oct 2026, *Preparing*). The server caches catalogue content for an hour — restart it after re-seeding.

## Scripts

| Script | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed MongoDB |
| `npm run dev:db` | In-memory MongoDB for local development |

## Routes

| Route | Design |
|---|---|
| `/compare-models` | 02 Compare Models |
| `/institutional-quote` | 08 Request Institutional Quote |
| `/help` | 09 Help & FAQs |
| `/cart` · `/checkout` · `/order-confirmation/[ref]` | 10 · 11 · 12 |
| `/login` · `/create-account` · `/forgot-password` | 13 · 14 · 15 |
| `/account` · `/account/orders` · `/account/orders/[ref]` | 16 · 17 · 18 |
| `/shipping-exchanges-warranty` · `/privacy-policy` · `/terms-and-conditions` | 19 · 20 · 21 |
| `/` | Home page design (`RMAX Solutions Home page.png`) — hero, numbers, best sellers, testimonials |
| `/our-product` | Product Listing design — category pills, filters, sort, two card styles, compare banner |
| `/products/[slug]` | Product Detail design — gallery, price card, tabs, overview, features, specs, applications, related products, testimonial |
| `/about-us`, `/contact-us` | **no reference design** — composed from the design system and copy used elsewhere. `/contact-us` has a working form saved to MongoDB (`contactmessages`) |

The header from the Home design (logo · product search · Our Product / Contact Us / About Us · Login) is used on **every** page. It has no Cart link, so a `Cart · n` link appears only while the cart has items.

## API

All routes return `{ success, data, error }`; input is validated with Zod; public POST routes are rate-limited (in-memory — swap for a shared store such as Redis on multi-instance deployments).

`GET /api/products` · `GET/POST/PATCH /api/cart` · `GET/POST /api/orders` · `GET /api/orders/[ref]` · `POST /api/quote-requests` · `POST /api/auth/register` · `POST /api/auth/forgot-password` · `PATCH /api/account/profile` · `PATCH /api/account/addresses` · `POST /api/account/password` · Auth.js at `/api/auth/*`.

## Architecture notes

- **Cache Components.** Content reads (`products`, `faq`, `policies`) are `use cache` functions tagged for revalidation. Anything that reads cookies — cart count, session — streams behind `<Suspense>`.
- **Auth.js.** Credentials provider with bcrypt (12 rounds), JWT sessions, MongoDB adapter for the `users` collection. `proxy.ts` is only an optimistic cookie check for `/account/*`; every account page and API route re-verifies the session.
- **Carts** are per browser (httpOnly cookie → `carts` collection, keyed by product slug), not per account.
- **Orders** are saved without any payment gateway; the designs describe checkout as illustrative, so that copy is kept verbatim. New orders are numbered `RMAX-DEMO-002`, `-003`, …

## Known limitations

- "Remember me" on the login form is displayed but does not change session length.
- Forgot password stores a hashed reset token but does not send email and there is no reset page (neither is designed). In development the token is logged to the server console.
- Product photos were cropped from the design screenshots (see `public/images/home` and `public/images/products`). Gallery thumbnails 2–5 only exist as ~70px crops, so the large viewer shows them soft — replace with originals when available. Wording kept exactly as designed includes a few likely typos ("bussiness", "Principle", "Include of all tax"), the Listing's `$` price labels (shown as ₹ here) and an "ISI Certified 101:4002" claim that should be verified before launch.
- Unknown product URLs render the not-found page marked `noindex`, but the HTTP status is 200 (Next's Cache Components streams the shell first).
- Views that no design shows (empty cart, logged-in nav pill, quote success, edit-address / change-password panels) are minimal and listed as `ASSUMED` in the design-system doc.
