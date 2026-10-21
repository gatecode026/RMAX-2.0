# RMAX Solutions — Design System & Screen Map

Source of truth: the 17 images in `.context/`. Values marked `ASSUMED` were not directly visible or were estimated from a screenshot.
Colours marked `(sampled)` were read from pixels of the screenshots. All screens are 1440 px wide desktop exports; no tablet or mobile frames exist, so every responsive value is `ASSUMED`.

---

## 0. BLOCKING ISSUE — two visual styles in the references

| | **Style A — "Navy / Warm"** | **Style B — "Blue / Cool"** |
|---|---|---|
| Screens | `08 Request Institutional Quote`, `09 Help & FAQs`, `Design System.png` | `02`, `10`–`21` (all other screens) |
| Page bg | Warm canvas `#FBF9F5` (sampled) | Light-blue → near-white gradient `#E1F5FF` → `#FFFFFF` → `#EAF1FE` (sampled) |
| Headings | Montserrat ExtraBold 800 | Looks like Plus Jakarta Sans ExtraBold, tight tracking (`ASSUMED`) |
| Primary button | Navy `#083176`→`#2F5894` gradient (pill) | Bright blue→cyan gradient `#0B65FE`→`#0EA3E9` (pill) |
| Login pill | Navy | Bright blue `#0B62FF` (sampled) |
| Dark surfaces / footer | Charcoal `#232A32` (sampled) | Near-black navy `#020618` (sampled) |
| Eyebrow / link colour | Navy | Bright blue `#0B62FF` |

`Design System.png` says it documents "the nine selected screens", but only 08 and 09 visibly follow it. The other screens still show the older blue theme. **Which style wins must be decided by the owner. Nothing is built until then.** Both are documented below.

---

### DECISION (owner): Style A is used on every screen
Screens 02 and 10–21 were re-skinned with Style A tokens (§2). Mapping applied: bright-blue accents/links/eyebrows → navy `#002970`; blue→cyan gradient buttons → navy `#002970`→`#315B96`; light-blue gradient background → warm canvas `#FBF9F5`; `#020618` dark surfaces/footer → charcoal `#232A32`; Plus Jakarta Sans headings → Montserrat 800; status/pill chips → `soft` blue surface with navy text. Layout, copy and imagery are unchanged.

### Implementation deviations & assumptions (as built)
- Navbar spans 1440 − 2×76 px (logo at x=76 as in the designs); the Login pill therefore sits at x≈1364 rather than the exported x≈1264.
- Logged-in navbar shows the user's first name in the pill (links to `/account`); not designed.
- Empty cart / empty checkout, quote-request success, address editor, change-password panel, FAQ collapsed (`+`) icon, form focus/error states: not designed — minimal versions in the same style.
- Error colour `#B3261E` / `#FBEAE8` is `ASSUMED`.
- `Our Product` → redirects to `/compare-models`; `Home`, `About Us`, `Contact Us` are placeholder pages.
- Compare Models: original price is plain muted text as drawn (visually-hidden "Original price" label added for screen readers).
- Fonts: Montserrat 800 (headings) and Manrope (body) via `next/font`; Style B's heading font is not used.
- Responsive: no tablet/mobile frames exist. Breakpoints: nav collapses < 1024 px, grids stack < 1024 px, compare table scrolls horizontally < 1156 px. Verified: no horizontal page overflow at 390 and 768 px.
- Lighthouse (production build): Accessibility 100, Best Practices 100, SEO 100 (`/checkout` is intentionally disallowed in robots.txt).

## 1. Screen map (image → route)

| # | Image | Route | Style | Notes |
|---|---|---|---|---|
| — | `Design System.png` | — (reference only) | A | Token spec board |
| — | `Frame.png` | — | — | 1155×371 near-white "rmax" wordmark fragment on transparent/white. Unusable as a logo (see §9) |
| 02 | Compare Models | `/compare-models` | B | Footer is rendered **above** the content and absent at the bottom — export artifact. Assumed: normal footer at the bottom |
| 08 | Request Institutional Quote | `/institutional-quote` | A | Form → MongoDB |
| 09 | Help & FAQs | `/help` | A | Accordion, 7 categories |
| 10 | Shopping Cart | `/cart` | B | |
| 11 | Checkout | `/checkout` | B | Form → MongoDB |
| 12 | Order Confirmation | `/order-confirmation/[ref]` | B | |
| 13 | Login | `/login` | B | |
| 14 | Create Account | `/create-account` | B | |
| 15 | Forgot Password | `/forgot-password` | B | Shows the *success* state; the empty state is derived |
| 16 | My Account | `/account` | B | |
| 17 | My Orders | `/account/orders` | B | |
| 18 | Order Detail & Tracking | `/account/orders/[ref]` | B | |
| 19 | Shipping, Exchanges & Warranty | `/shipping-exchanges-warranty` | B | Long-form policy |
| 20 | Privacy Policy | `/privacy-policy` | B | Long-form policy |
| 21 | Terms & Conditions | `/terms-and-conditions` | B | Long-form policy |

**Image numbering skips 01 and 03–07.** These are probably Home, Our Product, Contact Us and About Us, but nothing in `.context/` shows them. The navbar links to Home / Our Product / Contact Us / About Us / Cart · 1 / Help, and the footer links to Contact Us. **There is no design for those four pages.**

### Shared components
- **Navbar** (all screens): white-boxed logo (left) · Home · Our Product · Contact Us · About Us · "Cart · 1" (accent colour) · Help · Login pill (right). The user menu when logged in is not shown.
- **Footer** (all screens): 4 columns. Brand + "Advanced hygiene devices and products." | OUR PRODUCTS (Basic · ₹3,000 / Pro · ₹4,500 / Pro-Max · ₹6,500) | SUPPORT (Help & FAQs / Contact Us / My Account) | POLICIES (Privacy Policy / Terms & Conditions / Shipping, Exchanges & Warranty). Divider, then "RMAX Solutions · HYGIENE TECHNOLOGY · Free shipping · Exchange only · In-house manufacturing".
- **Breadcrumb** (Home › Page): present on 02, 08, 09, 10, 11, 16, 17, 18, 19, 20, 21 (not on 12–15).
- **Eyebrow label** (uppercase, 12/20, ExtraBold, accent colour) above each H1.
- **Page hero**: eyebrow, H1, lead paragraph.
- **Order summary card**, **product line item**, **status pill/badge**, **dark CTA band**, **"Draft for review" notice**, **"On this page" sticky TOC card**, **account sidebar**, **dark "Built for busy institutions." card with product thumbnail**.

---

## 2. Design tokens — Style A (documented in `Design System.png`)

### Colours
| Token | Hex | Use |
|---|---|---|
| `navy` (primary) | `#002970` | Actions, emphasis |
| `charcoal` | `#232A32` | Headings, dark surfaces |
| `canvas` | `#FBF9F5` | Page background |
| `card` | `#FDFDFD` | Cards, light foreground |
| `blue-secondary` | `#315B96` | Secondary accent, gradient end |
| `muted-light` | `#586574` | Muted text on light |
| `muted-dark` | `#B8C4D4` | Muted text on dark |
| `border` | `#D6DCE4` | Borders |
| `soft-blue` | `#EAF0F8` | Soft surfaces |
| `success` | `#257052` | Success |
| `success-surface` | `#E8F2EC` | Success surface |
| Primary gradient | `#002970` → `#315B96` (≈90°) | Primary buttons |

### Typography
- **Headings:** Montserrat 800. **Body/controls/labels:** Manrope (400 / 700 / 800).
- Font-size inventory: 12, 16, 20, 24, 28, 32, 36, 40, 48, 52, 72, **152** (404 numeral only). Line-heights are multiples of 4.

| Role | Font | Size / line-height | Weight |
|---|---|---|---|
| Display (H1) | Montserrat | 52 / 64 | 800 |
| Section (H2) | Montserrat | 36 / 44 | 800 |
| Card (H3) | Montserrat | 24 / 36 | 800 |
| Body | Manrope | 16 / 24 | 400 |
| Control (button, nav) | Manrope | 16 / 20 | 700 |
| Label / eyebrow | Manrope | 12 / 20 | 800, uppercase |
| 404 numeral | Montserrat | 152 | 800 |

Letter-spacing and the 20/28/32/40/48/72 uses are not mapped to roles in the board. They are `ASSUMED` (H4 ≈ 20/28, H5/H6 = 16/24 bold).

### Radii (4 px grid)
0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40. Inputs 16 · action buttons 28 · cards 32–40 · pills "rounded up to the nearest multiple of 4".

### Spacing (4 px grid)
Gap: 0 4 8 12 16 20 24 28 32 36 40 148 152 208. Padding: 0 4 8 12 16 20 24 28 32 36 40 56 64 80 132 308 316. Light card = radius 32 · padding 28 · gap 20; input radius 16 · label gap 8.

---

## 3. Design tokens — Style B (sampled / measured from screens 02, 10–21)

### Colours
| Token | Hex | Source |
|---|---|---|
| `accent` (links, eyebrows, text buttons) | `#0B62FF` | sampled (login pill) |
| `btn-grad-start` | `#0B65FE` | sampled |
| `btn-grad-end` | `#0EA3E9` | sampled (left→right) |
| `bg-start` (top-left) | `#E1F5FF` | sampled |
| `bg-end` (bottom-right) | `#EAF1FE` | sampled |
| `bg-mid` | `#FFFFFF` | sampled (diagonal gradient centre) |
| `surface` | `#FFFFFF` | cards |
| `surface-tint` (table zebra, info boxes) | `#EFF6FF` | sampled |
| `dark` (footer, dark cards) | `#020618` | sampled |
| `success-surface` | `#DCFCE7` | sampled (confirmation circle, reset notice) |
| `success-text` | ≈`#15803D` | ASSUMED |
| `text-heading` | ≈`#020618` | ASSUMED (same as dark) |
| `text-body` / muted | ≈`#5B6B82` | ASSUMED (grey-blue) |
| `border` | ≈`#DCE3EE` | ASSUMED |
| Discount badge / pill bg | ≈`#EAF2FF` (pill), `#DBE9FF` | ASSUMED |

### Typography (ASSUMED — closest Google Fonts)
- Headings: **Plus Jakarta Sans** 800, tight tracking (≈ −0.02em), trailing full-stop styled with extra spacing.
- Body: **Manrope** (matches Style A body).
- Estimated sizes at 1440: H1 ≈ 56/64 (single line) · card/section titles 24–28/32 · product price 28–32 · body 16/24 · small 14/20 · eyebrow 12/20 ExtraBold uppercase.

### Radius / borders / shadows
- Cards 32–36 px, 1 px very light border + soft shadow (`0 2px 8px rgba(2,6,24,.06)`, ASSUMED).
- Inputs ≈ 16 px radius, 1 px border, height 56 (e.g. 08: y520–576). Pills/buttons fully rounded (height ≈ 50).
- Product thumbnails 24–32 px radius.

---

## 4. Shared layout (both styles)
- Viewport 1440. **Content container ≈ 1180 px** (x 130 → 1310). The navbar spans wider (x 76 → ≈1264), so it is probably a separate full-width container with 76 px side padding.
- Navbar height 92. Section vertical rhythm ≈ 64–96 px between hero and first content block.
- Grid (12-col, `ASSUMED`): compare table uses 4 columns (label 1fr + 3 products ≈ 280 px each, gap 24). Checkout/Cart are 2 columns ≈ 8/4 (780 + 370). Auth screens are 2 columns (left copy ≈ 620, right card ≈ 510). Account is 3/9 (250 + 905). Policy pages are 3/9 (sidebar 265 + body 830).
- Breakpoints (`ASSUMED`): 375 / 768 / 1024 / 1280 / 1440.

## 5. Components
- **Primary button:** pill, height 50, padding 0 28, 16/20 Manrope 700, white text, gradient fill. Hover = brightness −8 % (`ASSUMED`). Disabled = 50 % opacity (`ASSUMED`).
- **Secondary / outline button:** pill, height 50, white fill, 1 px border, accent text.
- **Text link:** accent colour, e.g. "Forgot password?".
- **Small pill button** (Login, Edit address, View order): height 36–44.
- **Input:** height 56, radius 16, 1 px border, placeholder = muted, label 14–16 bold above with 8 px gap; required marked with `*` inside label **and** placeholder (e.g. "Email *"). Focus ring and error state are **not shown** → `ASSUMED` (2 px accent ring; red text below field).
- **Select:** same as input + chevron-down. **Textarea:** height ≈ 112. **Checkbox:** 16 px, rounded 4 (blue checked state on 11).
- **Badge/pill:** uppercase 12 ExtraBold, accent text, pale-blue fill, radius full (e.g. "50% LAUNCH OFFERS", "GUEST CHECKOUT", "ILLUSTRATIVE ORDER · RMAX-DEMO-001"). Status pill: "Preparing · Example".
- **Accordion (09):** row with question + circular ✕ icon button at right, answer panel below on a tinted background; category chip above each. All items are shown expanded; collapsed look is `ASSUMED`.
- **Stepper (18):** 4 nodes (Confirmed, Preparing, Dispatched, Delivered), filled blue = reached, grey = pending, connector lines, label + sub-label.
- **Compare table (02):** zebra rows, bold labels, muted values.
- **Icons:** Lucide `chevron-right` (breadcrumb), `chevron-down` (select), `x` (FAQ), `check` (confirmation), logo glyph = hexagon in blue rounded square.

## 6. Imagery
- 3 product photos (grey studio backdrop, 4:3-ish at 280×190 on 02; square thumbs elsewhere with radius 24; 310×220 on 08). Not supplied as files (see §9).
- Logo: hexagon mark + "RMAX Solutions" + "HYGIENE TECHNOLOGY" tracked caption, on a white rectangle in the header.

## 7. Interactions visible
FAQ accordion; sidebar category jump links (09); "On this page" anchor links (19–21); cart quantity −/+ and Remove (10); select dropdowns; "Billing address is the same as shipping" toggle (11); order search and status filter (17); order progress (18); forgot-password success state (15).

## 8. Content details that need a decision
- All "illustrative / example / demo" wording (`RMAX-DEMO-001`, "No actual purchase or payment has been made", "No tax rate is assumed", "Draft for review") is part of the design. The brief says to use the exact text, but the PRD also wants real persisted orders. See Open Questions.
- "Cart · 1" is hard-coded in every navbar screen. Assumed to become a live cart count.

## 9. Asset problems
1. **Product photos & logo exist only inside screenshots.** They can be cropped, but at low resolution (≈280 px wide photos). Please supply originals if you have them.
2. **`Frame.png`** is a near-white wordmark fragment ("rnax"-like glyphs, #FDFDFD on white). It is not usable as the logo.
3. The Basic product photo (blue/white, "Blue / Pink" colourways) and Pro-Max (silver "AURA PRO-MAX") are visible only on 02; Pro appears on 08–18.
