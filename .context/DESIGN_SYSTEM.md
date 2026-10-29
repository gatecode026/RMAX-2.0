# RMAX Solutions — Design System Specification

Canonical design system for RMAX Solutions, matching the official Figma design system artboard (**RMAX Solutions / Design System**, 1600px Board, 1440px Desktop Content Layout, 4px Grid).

---

## 1. Core Principles & Spatial Foundation

- **Grid Principle:** **4 px increments** across typography, line-heights, cell sizes, spacing, padding, and corner radii.
- **Outer Artboard:** `1600px` width
- **Layout Desktop Frame:** `1440px` width
- **Page Container:** `1280px` (`max-w-(--container-page)`, representing `1440px - 2 × 80px` side padding)
- **Base Canvas:** `#FBF9F5` (Warm Canvas, set on `<body>`)
- **Visual Style:** Style A (Warm Canvas + Primary Navy + Charcoal + Card White) is the sole active design system across all screens.

---

## 2. Color Palette Tokens

### Core Colors (Foundations)
| Token | CSS Variable / Tailwind | Hex | Role |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | `--color-navy` / `navy` | `#002970` | Primary actions, branding, focus rings, emphasis |
| **Charcoal** | `--color-charcoal` / `charcoal` | `#232A32` | Headings, high-contrast dark text, dark surfaces, footer |
| **Warm Canvas** | `--color-canvas` / `canvas` | `#FBF9F5` | Global page background across all screens |
| **Card Foreground** | `--color-card` / `card` | `#FDFDFD` | Card surfaces, modal surfaces, raised light containers |

### Complementary Palette
| Token | CSS Variable / Tailwind | Hex | Role |
| :--- | :--- | :--- | :--- |
| **Secondary Accent** | `--color-navy-600` / `navy-600` | `#315B96` | Mid-navy gradient stop, hover states, secondary highlights |
| **Muted** | `--color-muted` / `muted` | `#586574` | Body text, descriptions, secondary copy on light surfaces |
| **Muted Dark** | `--color-muted-dark` / `muted-dark` | `#B8C4D4` | Supporting copy on dark surfaces, subtle inactive borders |
| **Border / Line** | `--color-line` / `line` | `#D6DCE4` | Dividers, card borders, field outlines, hairline separators |
| **Soft Surface** | `--color-soft` / `soft` | `#EAF0F8` | Spec chips, pill backgrounds, subtle input tints |
| **Success** | `--color-success` / `success` | `#257052` | Success badges, confirmation checkmarks, positive indicators |
| **Success Soft** | `--color-success-soft` / `success-soft` | `#E8F2EC` | Success pill backgrounds, soft notification fills |
| **Danger (System)** | `--color-danger` / `danger` | `#B3261E` | Validation errors, destructive alerts |
| **Danger Soft** | `--color-danger-soft` / `danger-soft` | `#FBEAE8` | Error alert backgrounds, invalid field highlights |

### Primary Action Gradient
```css
background: linear-gradient(90deg, #002970 0%, #315B96 100%);
```
- **Tailwind:** `bg-linear-to-r from-navy to-navy-600`

---

## 3. Typography Hierarchy

### Font Families
1. **`Montserrat`**: Reserved strictly for headings (H1–H6), display titles, numerals, and brand wordmarks.
2. **`Manrope`**: Used for all body copy, UI controls, navigation links, form labels, inputs, and captions.

### Type Scale Hierarchy
| Role | Family | Weight | Size / Line-height | Tracking | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display (H1)** | Montserrat | 800 (ExtraBold) | `52px` / `64px` (123%) | `-1.5px` | `#232A32` |
| **Section (H2)** | Montserrat | 800 (ExtraBold) | `36px` / `44px` (122%) | `-1.0px` | `#232A32` |
| **Card (H3)** | Montserrat | 800 / 700 | `24px` / `36px` (150%) | `-0.6px` | `#232A32` |
| **Body** | Manrope | 400 (Regular) | `16px` / `24px` (150%) | normal | `#586574` |
| **Body Small** | Manrope | 400 (Regular) | `14px` / `20px` (143%) | normal | `#586574` |
| **Control (Button)** | Manrope | 700 (Bold) | `16px` / `20px` (125%) | normal | `#002970` / `#FFFFFF` |
| **Label / Eyebrow** | Manrope | 800 (ExtraBold) | `12px` / `20px` (167%) | `+0.5px` | `#002970` / `#586574` |
| **Numeral (404)** | Montserrat | 800 (ExtraBold) | `152px` / `184px` | normal | `#002970` |

### Font Size Inventory (4px Multiples)
`12px` · `16px` · `20px` · `24px` · `28px` · `32px` · `36px` · `40px` · `48px` · `52px` · `72px` · `152px`

---

## 4. Corner Radii Inventory

All corner radii strictly follow 4px multiples:
- `0px`: Sharp edges, full-bleed structural frames
- `4px`: Mini checkboxes, status indicators
- `8px`: Micro tooltips, small popovers
- `12px`: Spec chips (`2x2` product card specifications)
- `16px`: Form inputs (`rounded-input`), select dropdowns, textareas
- `20px`: Inner image containers, product photo boxes
- `24px`: Medium cards, stat boxes
- `28px`: Primary action buttons (`rounded-action`), showcase cards
- `32px`: Standard light cards (`rounded-card`), testimonial review cards
- `36px`: Feature cards, hero testimonial wrapper
- `40px`: Large dark containers (`rounded-card-lg`), modal outer shells
- `9999px`: Fully circular pills (`rounded-full`), avatars, slider thumbs

---

## 5. Spacing & Padding Scale

- **Scale:** `0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 px`
- **Extended Structural Steps:** `56, 64, 80, 132, 148, 152, 208, 308, 316 px`
  - `208px`: Structural layout / hero offset
  - `80px` / `64px`: Desktop section vertical rhythm and container margin

---

## 6. In-Combination Component Blueprints

### Light Card
- `radius: 32px` (`rounded-card`)
- `padding: 28px` (`p-7`)
- `gap: 20px` (`gap-5`)
- `border: 1px solid #D6DCE4` (`border-line`)
- `background: #FDFDFD` (`bg-card`)

### Form Input
- `height: 56px` (`h-14`)
- `radius: 16px` (`rounded-input`)
- `border: 1px solid #D6DCE4` (`border-line`)
- `background: #FDFDFD` (`bg-card`)
- `label: 12px/20px Manrope 800` (`text-label font-extrabold text-navy`) with `8px` gap

### Primary Action Button
- `height: 44px–52px` (`h-11`–`h-13`)
- `radius: 20px` or `28px` (`rounded-action`)
- `background: linear-gradient(90deg, #002970 0%, #315B96 100%)`
- `typography: Manrope 700 16px/20px text-white`
