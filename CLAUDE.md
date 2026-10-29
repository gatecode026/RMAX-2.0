# RMAX Solutions — Design System Specification & Engineering Guidelines

This document is the **canonical source of truth** and authoritative instruction manual for all AI agents, engineers, and contributors working on the **RMAX Solutions** web application (`r:\RMAX2`).

Derived directly from the official Figma Design System specification (**RMAX Solutions / Design System**, 1600px Board, 1440px Desktop Content Layout).

---

## 1. Core Philosophy & The 4 px Grid Principle

The entire RMAX Solutions visual language is governed by **4 px increments**. Every measurement — typography sizes, line-heights, element cell sizes, spacing, padding, margins, and corner radii — MUST align with the 4 px rhythmic grid.

- **Outer Board Canvas:** `1600px` (Artboard reference)
- **Desktop Content Frame:** `1440px`
- **Inner Content Container:** `1280px` (`max-w-(--container-page)`, representing `1440px - 2 × 80px` gutters)
- **Base Canvas Tone:** `#FBF9F5` (Warm Canvas, applied globally to `<body>`)
- **Zero-Arbitrary Rule:** Never introduce one-off, arbitrary pixel numbers or unapproved color hexes.

---

## 2. Color Palette Tokens

Every color in the interface belongs to either the **Core Foundations** or the **Complementary Palette**.

### Core Colors (Foundations)

| Token Name | CSS Variable / Tailwind | Hex Code | Visual Role |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | `--color-navy` / `navy` | `#002970` | Primary actions, brand emphasis, active states, focus rings, primary links |
| **Charcoal** | `--color-charcoal` / `charcoal` | `#232A32` | Primary headings (H1–H6), high-contrast titles, dark surfaces, footer background |
| **Warm Canvas** | `--color-canvas` / `canvas` | `#FBF9F5` | Global page surface background across all screens |
| **Card Foreground** | `--color-card` / `card` | `#FDFDFD` | Card surfaces, modals, elevated white containers, raised panels |

### Complementary Palette

| Token Name | CSS Variable / Tailwind | Hex Code | Visual Role |
| :--- | :--- | :--- | :--- |
| **Secondary Accent** | `--color-navy-600` / `navy-600` | `#315B96` | Mid-navy gradient stop, hover states, secondary visual accents |
| **Muted Text** | `--color-muted` / `muted` | `#586574` | Body copy, secondary descriptions, subtitles, subtle metadata |
| **Muted Dark** | `--color-muted-dark` / `muted-dark` | `#B8C4D4` | Supporting copy on dark (charcoal) surfaces, subdued dark borders |
| **Border / Line** | `--color-line` / `line` | `#D6DCE4` | Dividers, card borders, field outlines, hairline separators |
| **Soft Surface** | `--color-soft` / `soft` | `#EAF0F8` | Spec chips, neutral pills, badge backgrounds, input tints |
| **Success** | `--color-success` / `success` | `#257052` | Success indicators, verified badges, order confirmed status |
| **Success Soft** | `--color-success-soft` / `success-soft`| `#E8F2EC` | Success badge background, positive notification tint |
| **Danger (System)**| `--color-danger` / `danger` | `#B3261E` | Validation errors, destructive alerts, error banners |
| **Danger Soft** | `--color-danger-soft` / `danger-soft` | `#FBEAE8` | Error alert background, invalid field highlight |

### Primary Action Gradient

```css
background: linear-gradient(90deg, #002970 0%, #315B96 100%);
```
- **Tailwind Utility:** `bg-linear-to-r from-navy to-navy-600` (or `bg-gradient-to-r from-[#002970] to-[#315B96]`)
- **Usage:** Primary action buttons, prominent CTAs, featured banner highlights.

---

## 3. Typography Hierarchy

The design system pairs two distinct Google Fonts:
1. **`Montserrat`**: Reserved strictly for headings, display typography, bold brand markers, and large numerical metrics.
2. **`Manrope`**: Used for all body text, UI controls, navigation links, form labels, inputs, and supporting captions.

> [!IMPORTANT]
> Do NOT use `Plus Jakarta Sans`, `Inter`, `Roboto`, or other rogue font families in new components. Any legacy `font-jakarta` references must resolve to `font-heading` (`Montserrat`) or `font-sans` (`Manrope`).

### Type Scale Hierarchy

| Role | Font Family | Weight | Size | Line Height | Tracking | Color Token | Tailwind Class Equivalent |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display (H1)** | Montserrat | 800 (ExtraBold) | `52px` | `64px` (123%) | `-1.5px` | `charcoal` (`#232A32`) | `font-heading text-display font-extrabold text-charcoal` |
| **Section (H2)** | Montserrat | 800 (ExtraBold) | `36px` | `44px` (122%) | `-1.0px` | `charcoal` (`#232A32`) | `font-heading text-section font-extrabold text-charcoal` |
| **Card (H3)** | Montserrat | 800 / 700 | `24px` | `36px` (150%) | `-0.6px` | `charcoal` (`#232A32`) | `font-heading text-title font-extrabold text-charcoal` |
| **Body** | Manrope | 400 (Regular) | `16px` | `24px` (150%) | normal | `muted` (`#586574`) | `font-sans text-body text-muted` |
| **Body Small** | Manrope | 400 (Regular) | `14px` | `20px` (143%) | normal | `muted` (`#586574`) | `font-sans text-body-sm text-muted` |
| **Control (Button)**| Manrope | 700 (Bold) | `16px` | `20px` (125%) | normal | `white` / `navy` | `font-sans text-body font-bold leading-5` |
| **Label / Eyebrow** | Manrope | 800 (ExtraBold) | `12px` | `20px` (167%) | `+0.5px` | `navy` / `muted` | `font-sans text-label font-extrabold tracking-wider uppercase` |
| **Numeral (404)** | Montserrat | 800 (ExtraBold) | `152px`| `184px` (121%) | normal | `navy` (`#002970`) | `font-heading text-numeral font-extrabold text-navy` |

### Complete Font Size Inventory (4px Multiples)
`12px` · `16px` · `20px` · `24px` · `28px` · `32px` · `36px` · `40px` · `48px` · `52px` · `72px` · `152px`

---

## 4. Corner Radii Inventory

All corner radii strictly follow 4px multiples:

| Radius | Token / Class | Standard Element Assignment |
| :--- | :--- | :--- |
| **`0px`** | `rounded-none` | Default unrounded edge, full bleed structural frames |
| **`4px`** | `rounded-[4px]` | Mini checkboxes, tiny status indicators |
| **`8px`** | `rounded-lg` / `rounded-[8px]` | Micro tooltips, small dropdown items |
| **`12px`** | `rounded-[12px]` | Spec chips (`2x2` product card specifications) |
| **`16px`** | `--radius-input` / `rounded-input` | **Small controls & inputs** (form text inputs, select dropdowns, textareas) |
| **`20px`** | `rounded-[20px]` | Inner image containers, product photo boxes, compact action pills |
| **`24px`** | `rounded-[24px]` | Medium cards, stat boxes |
| **`28px`** | `--radius-action` / `rounded-action` | **Primary action buttons**, showcase cards, medium dialogs |
| **`32px`** | `--radius-card` / `rounded-card` | **Standard light cards**, testimonial review cards, profile shells |
| **`36px`** | `rounded-[36px]` | Feature cards, hero testimonial wrapper |
| **`40px`** | `--radius-card-lg` / `rounded-card-lg` | Large dark containers, full hero promo banners, modal outer shells |
| **`9999px`**| `rounded-full` | Fully circular pills, author avatar circles, slider thumbs, icon buttons |

---

## 5. Spacing, Padding & Layout System

### Spacing Scale (4 px Grid)
- **Standard Scale:** `0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 px`
- **Extended Structural Steps:** `56, 64, 80, 132, 148, 152, 208, 308, 316 px`
  - `208px`: Structural layout / hero offset.
  - `80px` / `64px`: Desktop section vertical rhythm and container margin.

### Container & Layout Constraints
```tsx
// Standard Page Container
<div className="mx-auto w-full max-w-(--container-page) px-5 sm:px-8 lg:px-12 xl:px-16">
  {children}
</div>
```
- Content width: `1280px` desktop (`--container-page`).
- Navbar height: `92px` (`--header-height: 92px`).
- Section vertical spacing: `py-10 md:py-16` or `mt-16 md:mt-24`.

---

## 6. Component Blueprints & In-Combination Patterns

### 1. Light Card (Standard Container)
- **Background:** `#FDFDFD` (`bg-card`)
- **Border:** `1px solid #D6DCE4` (`border border-line`)
- **Radius:** `32px` (`rounded-card`)
- **Padding:** `28px` (`p-7`)
- **Gap:** `20px` (`gap-5`)
- **Elevation:** `shadow-card` (`0 2px 12px rgb(35 42 50 / 0.06)`)

```tsx
<div className="rounded-card border border-line bg-card p-7 shadow-card">
  {/* Content */}
</div>
```

### 2. Form Field / Text Input
- **Height:** `56px` (`h-14`)
- **Corner Radius:** `16px` (`rounded-input`)
- **Border:** `1px solid #D6DCE4` (`border-line`)
- **Background:** `#FDFDFD` (`bg-card`)
- **Text:** `16px/24px` Manrope (`text-body text-charcoal`)
- **Label:** `12px/20px` Manrope 800 (`text-label font-extrabold text-navy`) with `8px` gap (`mb-2`)
- **Focus Ring:** `outline-none focus:border-navy focus:ring-2 focus:ring-navy/20`

### 3. Primary Action Button
- **Height:** `44px` to `52px` (`h-11` to `h-13`)
- **Corner Radius:** `28px` (`rounded-action`) or `20px`
- **Background:** `linear-gradient(90deg, #002970 0%, #315B96 100%)`
- **Typography:** Manrope 700 (Bold), `16px` / `20px` (`text-body font-bold leading-5`)
- **Text Color:** `#FFFFFF` (`text-white`)
- **Hover:** `hover:brightness-110 active:brightness-95 transition-all`

```tsx
<button className="inline-flex h-13 items-center justify-center rounded-action bg-linear-to-r from-navy to-navy-600 px-7 text-body font-bold text-white transition hover:brightness-110 active:brightness-95">
  Primary Action
</button>
```

### 4. Secondary & Charcoal Buttons
- **Secondary (Outline):** `border border-line bg-card text-navy hover:border-navy hover:bg-soft rounded-action`
- **Charcoal (Compact "View" Button):** `bg-charcoal text-white hover:bg-navy rounded-full px-7 py-2.5 text-[14px] font-bold`

### 5. Badges, Chips & Pills
- **Soft Neutral Chip:** `bg-soft text-navy rounded-full px-4 py-1 text-label font-extrabold uppercase`
- **Success Chip:** `bg-success-soft text-success rounded-full px-4 py-1 text-label font-extrabold uppercase`
- **Spec Chip (2x2 Grid):** `rounded-[12px] bg-soft px-3.5 h-10 text-[13px] font-semibold text-muted truncate`

### 6. Dark Surface Card
- **Background:** `#232A32` (`bg-charcoal`)
- **Heading:** `#FDFDFD` / `#FFFFFF`, Montserrat 800
- **Body / Supporting:** `#B8C4D4` (`text-muted-dark`), Manrope 400
- **Corner Radius:** `32px` to `40px` (`rounded-card` to `rounded-card-lg`)

---

## 7. Strict Engineering Rules for AI Agents

1. **Always Use Tailwind Theme Tokens:**
   - Use `text-navy`, `bg-navy`, `text-charcoal`, `bg-canvas`, `bg-card`, `text-muted`, `border-line`, `bg-soft`, `text-success`.
   - Never write arbitrary blues like `#10469B`, `#0B62FF`, `#0A2558`, `#1E293B` when a system token exists.
2. **Strict Font Enforcement:**
   - Headings & Titles: `font-heading` (`Montserrat 800 / 700`).
   - Body & Controls: `font-sans` (`Manrope 400 / 700 / 800`).
   - Do not add or reference external untracked fonts.
3. **Strict Radius Enforcement:**
   - Inputs = `rounded-input` (`16px`).
   - Action buttons = `rounded-action` (`28px` or `20px` / `rounded-full`).
   - Standard Cards = `rounded-card` (`32px` or `28px`).
   - Large hero/banner wrappers = `rounded-card-lg` (`40px`).
4. **Preserve Documentation Integrity:**
   - Always preserve comments and docstrings.
5. **Verification Protocol:**
   - Run `npx tsc --noEmit` and `npm run build` after any styling refactor to guarantee zero compilation errors.

