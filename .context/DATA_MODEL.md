# RMAX Solutions — Data Model Proposal (for review before any code)

Stack: MongoDB + Mongoose, every schema `timestamps: true`. Zod validation mirrors each schema at API boundaries.

## 1. Dynamic content found in the designs

| Content | Where | Count | Collection |
|---|---|---|---|
| Products (Basic / Pro / Pro-Max) with prices, strike-through prices, specs, images | 02, 08, 10, 12, 16–18, footer | 3 | `products` |
| Compare-table spec rows | 02 | 10 rows × 3 | embedded in `products.specs` |
| FAQ items (+ 7 categories) | 09 | 7 | `faqitems` |
| Policy pages (sections + TOC) | 19, 20, 21 | 3 pages (7 / 8 / 9 sections) | `policypages` |
| Cart | 10 | 1 per visitor | `carts` |
| Orders (+ tracking steps) | 11, 12, 16, 17, 18 | 1 seeded demo (`RMAX-DEMO-001`) | `orders` |
| User profile + addresses | 13–16 | 1 seeded demo (Asha Rao) | `users` |
| Institutional quote requests | 08 | 0 seeded | `quoterequests` |
| Password reset requests | 15 | 0 seeded | `passwordresettokens` |

Static (kept in code, **not** the DB, because they are navigation chrome rather than content): navbar links, footer columns and the footer tagline. Footer product prices are read from `products`.

## 2. Forms found

| Form | Screen | Fields | Persists to |
|---|---|---|---|
| Institutional quote | 08 | Organization name*, Institution type* (select), Contact person*, Role/department, Email*, Phone (optional), Preferred model* (select, default "Pro · 200–250/day"), Quantity* (default 1), Expected daily usage* ("Approximate number of napkins"), Delivery city & postal code*, Use case & number of locations* (textarea), Installation requirements* (textarea), consent checkbox* | `quoterequests` |
| Checkout | 11 | **Contact:** Full name*, Email*, Phone for delivery*. **Institutional shipping:** Organization/institution*, Department/recipient*, Street address*, Address line 2, City*, State* (select), Postal code*, Country* (default India), Delivery/installation notes. **Billing:** same-as-shipping checkbox (default on), Billing organization*, Purchase order reference (optional). **Payment:** method select (illustrative: "Online payment · example selection"), Terms checkbox* | `orders` |
| Login | 13 | Email*, Password*, Remember me | Auth.js (credentials) |
| Create account | 14 | Full name*, Email*, Organization (optional), Password*, Confirm password*, Terms checkbox* | `users` |
| Forgot password | 15 | Account email* | `passwordresettokens` |
| Profile | 16 | Full name, Organization, Email (read-only?), Phone → "Save profile" | `users` |
| Order search / filter | 17 | Search by order reference, Order status select (All orders…) | read-only query |
| Cart quantity / remove | 10 | − / + / Remove | `carts` |

\* required. Buttons whose forms are **not** designed: *Change password*, *Edit address*, *Add / edit billing*, *Contact support*, *Contact Us* (see Open Questions).

## 3. Mongoose models

### `Product`
```
slug            String  unique, index   // 'basic' | 'pro' | 'pro-max'
name            String                  // 'Basic' | 'Pro' | 'Pro-Max'
title           String                  // 'Napkin Incinerator Machine (Pro)'
shortName       String                  // 'Pro napkin incinerator'
price           Number  (₹, required)   // 3000 | 4500 | 6500
originalPrice   Number                  // 6000 | 9000 | 13000
discountPercent Number  default 50
image           { src, alt, width, height }
specs {
  dailyCapacity   String   // '80–100/day' | '200–250/day' | '400–500/day'
  batchCapacity   String   // 'Not specified' | '4–6 at once' | '6–8 at once'
  power           String   // '800 W' | '1000 W' | '1200 W'
  weight          String   // '8kg' | '9kg' | '10kg'
  colours         String   // 'Blue / Pink' | 'See supplied image'
  cycleDuration   String   // '3–4 minutes'
  chamber         String   // 'Enclosed high-temperature'
  maintenance     String   // 'Low maintenance'
  warranty        String   // '1 year'
  delivery        String   // '3–5 days · Free shipping'
}
sortOrder       Number  index
```
Display strings are stored verbatim from the design (e.g. "4–6 at once"). Numeric fields would be invented structure. The cart/order spec line (`1000 W · 9kg · 200–250/day · 4–6 at once`) is composed from `specs`.

### `User`
```
name, email (unique, lowercase, index), organization?, phone?, passwordHash (select:false)
shippingAddress { organization, recipient, department, street, line2?, city, state, postalCode, country }
billingSameAsShipping Boolean default true
billingAddress? { …same }
```
Auth.js with the MongoDB adapter uses its own `accounts`/`sessions`/`verificationTokens` collections. Note: the Credentials provider forces the **JWT** session strategy (database sessions are not supported with credentials). The adapter is still used for the `users` collection.

### `Cart`  *(as built)*
```
token: String unique              // opaque value in an httpOnly cookie — carts are per browser
items: [{ slug: String, quantity: Number 1–999 }]   // keyed by product slug, stable across re-seeds
```
TTL index: carts expire after 30 days without updates (`ASSUMED`).

### `Order`
```
reference   String unique index   // 'RMAX-DEMO-001' for the seed; new orders continue 'RMAX-DEMO-002…' (atomic `counters` sequence)
user?       ObjectId→User
contact     { fullName, email, phone }
items       [{ product, title, shortName, specLine, unitPrice, originalPrice, quantity, image }]  // snapshot
subtotal, shipping (0 → "Free"), total   Number
shippingAddress { organization, department, street, line2?, city, state, postalCode, country, notes? }
billing     { sameAsShipping, organization, poReference? }
payment     { method: String, status: 'illustrative' }
status      enum 'confirmed' | 'preparing' | 'dispatched' | 'delivered'  default 'preparing' (as in 12/16–18)
timeline    [{ step, at?: Date }]   // Confirmed 08 Oct 2026, Preparing (current), Dispatched Pending, Delivered Pending
termsAcceptedAt Date
isIllustrative Boolean
```
Index `{ user: 1, createdAt: -1 }` and `{ reference: 1 }`.

### `QuoteRequest`
```
organizationName, institutionType enum ['Schools','Offices','Hospitals','Hostels','Public washrooms'],
contactPerson, role?, email, phone?, preferredModel enum ['basic','pro','pro-max','help-me-choose'],
quantity Number min 1, expectedDailyUsage String, deliveryCityPostal String,
useCase String, installationRequirements String, consent Boolean (must be true), status default 'new'
```
Institution-type options come from the hint line under the select on 08 ("Schools · Offices · Hospitals · Hostels · Public washrooms"). "Help me choose" comes from the sidebar copy ("Select 'Help me choose' in the model field").

### `ContactMessage`  *(Contact Us page)*
`name`, `email`, `phone?`, `enquiryType` ('Sales' | 'Service'), `model?` ('basic' | 'pro' | 'pro-max'), `orderReference?`, `message`, `consent` (must be true), `status`. Written by `POST /api/contact-messages` (Zod-validated, HTML stripped, 5/hour/IP).

### `Testimonial`, `SiteSetting`  *(Home + product pages)*
`Testimonial`: `name`, `role`, `quote`, `rating`, `dateLabel`, `featured`, `product?`, `forProduct?`, `image?`, `sortOrder`. `SiteSetting`: `{ key, value }` — `home.stats` (the four numbers), `home.reviews` (4.8 / 4½ stars / label), `product.trust` (warranty · delivery · certification row).

### `Product` additions  *(Listing + Detail designs)*
`category` ('incinerator' | 'pad-vending'), `colours[]` (filter keys), `cardImage` / `listImage` / `portraitImage` (the three card photo styles), `summary`, `badge {label,tone}`, `highlight`, `mrp?`, `chips?`, and detail content: `intro`, `overview`, `overviewImage`, `gallery[]`, `features[]`, `applications[]`, `techSpecs[]`. A fourth catalogue item (Coin-operated pad vending machine, ₹8,500) powers Related products and the "Pad vending machines" filter; Compare, the footer, search and forms still use only the three incinerators.

### `FaqItem`
`category enum [Operation, Selection, Installation, Delivery, Exchanges, Warranty, Service]`, `question`, `answer`, `sortOrder`.

### `PolicyPage`
`slug` (`shipping-exchanges-warranty` | `privacy-policy` | `terms-and-conditions`), `eyebrow`, `title` (e.g. "Support for your purchase."), `lead`, `draftNotice { title, body }`, `sections [{ id, title, body }]` (TOC is derived from `sections`).

### `PasswordResetToken`
`user`, `tokenHash`, `expiresAt` (TTL index), `usedAt?`.

## 4. API surface (planned)
`GET /api/products` · `GET/POST/PATCH/DELETE /api/cart` · `POST /api/orders`, `GET /api/orders`, `GET /api/orders/[ref]` · `POST /api/quote-requests` · `POST /api/auth/register`, `POST /api/auth/forgot-password`, Auth.js at `/api/auth/[...nextauth]` · `PATCH /api/account/profile`. All responses `{ success, data, error }`, Zod-validated, rate-limited on public POSTs, duplicate email → 409.

## 5. Seed (`npm run seed`)
3 products, 7 FAQs, 3 policy pages (full text transcribed from images 19–21), demo user *Asha Rao* (`facilities@example.org`, org *Sample Campus*, Pune, Maharashtra 411001, India; password to be set via env — **not** displayed in the design), and demo order `RMAX-DEMO-001` placed 08 Oct 2026, status *Preparing*.

## 6. Open data questions
See "Open questions" in the hand-off message.
