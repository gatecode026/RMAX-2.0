# RMAX Solutions — Complete Architecture Overview

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  
**Framework:** Next.js 16.4.2 (App Router with Turbopack)  

---

## 1. Executive Architecture Summary

RMAX Solutions is an enterprise-grade digital platform encompassing a public institutional & commercial product showcase, quotation booking system, customer portal, role-based administration dashboard, manager portal, and asynchronous real-time notification subsystem.

The application is structured as a full-stack Next.js 16 application running React 19, backed by MongoDB through Mongoose 9, authenticated via NextAuth v5 (Auth.js beta), and styled with custom CSS architecture and modern design tokens powered by Tailwind CSS v4.

---

## 2. Technology Stack & Runtime Profile

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Core Framework** | Next.js (App Router) | `16.4.2` | Partial Prerendering (PPR), Turbopack compilation, Cache Components |
| **View Library** | React / React DOM | `19.3.0` | React Server Components (RSC), Transitions, Actions |
| **Language & Typings** | TypeScript | `^5` | Strict compile-time validation, strong data models |
| **Database** | MongoDB | Server v7+ | Flexible document storage for catalog, quotes, leads, and orders |
| **ORM / ODM** | Mongoose | `^9.1.2` | Schema enforcement, middleware hooks, indexing, transaction boundaries |
| **Authentication** | NextAuth.js (Auth.js v5) | `5.0.0-beta.32` | JWT sessions, multi-role claims (`customer`, `manager`, `super_admin`) |
| **Password Hashing** | bcryptjs | `^3.0.3` | Salted credential hashing (12 rounds) |
| **Real-Time Stream** | Server-Sent Events (SSE) | Native Web API | Live push notifications to Manager and Super Admin dashboards |
| **Icons** | Lucide React | `^1.16.0` | Unified SVG iconography |
| **Date Processing** | date-fns | `^4.1.0` | ISO date formatting, relative timestamps, SLA calculations |
| **Styling** | Tailwind CSS v4 + Turbopack | `^4.0.0` | Variable font bindings, CSS design system, utility & component styles |

---

## 3. Directory & Module Structure

```text
r:\RMAX2\
├── src\
│   ├── app\                                # Next.js 16 App Router
│   │   ├── (site)\                         # Public site layout group
│   │   │   ├── page.tsx                    # Landing / Hero / Highlights
│   │   │   ├── our-product\                # Product catalog showcase
│   │   │   ├── products\[slug]\            # Product deep-dive pages
│   │   │   ├── compare-models\             # Multi-tier model specification comparison
│   │   │   ├── institutional-quote\        # Enterprise Quote Booking Form
│   │   │   ├── about-us\                   # Company profile, team, milestones
│   │   │   ├── contact-us\                 # Customer inquiry & location map
│   │   │   ├── help\                       # FAQ, documentation & support
│   │   │   ├── cart\                       # Shopping cart & session persist
│   │   │   ├── checkout\                   # Order finalization & address entry
│   │   │   ├── order-confirmation\[ref]\   # Post-purchase receipt & tracking
│   │   │   ├── account\                    # Customer profile & order history
│   │   │   ├── login\ & create-account\    # Customer auth views & modal fallbacks
│   │   │   └── legal (terms, privacy, etc.)# Compliance & statutory policies
│   │   ├── admin\                          # Super Admin Dashboard
│   │   │   ├── dashboard\                  # Global KPI metrics & revenue charts
│   │   │   ├── leads\                      # Inbound leads & conversion pipeline
│   │   │   ├── quotations\                 # Quote generation & revision workflow
│   │   │   ├── orders\ & orders\[id]\      # Order processing & fulfilment status
│   │   │   ├── products\ & create\         # Catalog inventory, pricing & specs
│   │   │   ├── customers\                  # Client directory & lifetime value
│   │   │   ├── institutions\               # Institutional client directory
│   │   │   ├── inventory\                  # Stock management & low-stock alerts
│   │   │   ├── enquiries\                  # Inbound contact messages & resolution
│   │   │   ├── service-requests\           # Maintenance, warranty & technician dispatch
│   │   │   ├── reports\                    # Sales velocity, revenue & lead analytics
│   │   │   ├── audit-logs\                 # Tamper-evident admin activity logging
│   │   │   ├── settings\                   # System-wide operational settings
│   │   │   ├── users\                      # Staff management (Managers & Admins)
│   │   │   └── login\                      # Staff authentication portal
│   │   ├── manager\                        # Manager Operational Portal
│   │   │   ├── dashboard\                  # Personal performance & assigned leads
│   │   │   ├── leads\ & leads\[id]\        # Direct lead interaction & calling desk
│   │   │   ├── quotations\                 # Assigned quote generation
│   │   │   ├── follow-ups\                 # SLA reminder engine (Overdue, Due Today)
│   │   │   └── profile\                    # Manager credentials & contact info
│   │   └── api\                            # REST Endpoints & Real-Time SSE
│   │       ├── admin\*                     # Super Admin CRUD endpoints
│   │       ├── manager\*                   # Manager assignment & follow-up endpoints
│   │       ├── account\*                   # Customer self-service API
│   │       ├── auth\*                      # NextAuth route handlers & password reset
│   │       ├── cart\                       # Server-side cart validation
│   │       ├── orders\                     # Order generation & confirmation
│   │       ├── quote-requests\             # Inbound quotation submission
│   │       ├── contact-messages\           # Customer contact submission
│   │       ├── notifications\              # Notification read/dismiss API
│   │       └── notifications\stream\       # Server-Sent Events live stream
│   ├── components\                         # Reusable UI & Layout Components
│   │   ├── header.tsx & footer.tsx         # Unified site navigation & sticky search
│   │   ├── AuthModal.tsx                   # Modal-based unified Customer Login/Register
│   │   ├── admin\ & manager\               # Dashboard shells, sidebars & KPI cards
│   │   └── ui\                             # Modals, drawers, badges, toast notifications
│   ├── context\                            # React 19 Client State Providers
│   │   ├── AuthModalContext.tsx            # Global state for customer auth modal
│   │   └── CartContext.tsx                 # Persistent cart state & storage sync
│   ├── hooks\                              # Custom React Hooks
│   │   └── useDesktopNotifications.ts      # Audio chime + Web Notification API + SSE
│   ├── lib\                                # Business Logic, Helpers & Database
│   │   ├── mongodb.ts                      # Mongoose singleton connection pool
│   │   ├── session.ts                      # Server-side session & RBAC guards
│   │   ├── audit.ts                        # Centralized audit logging utility
│   │   ├── notifications.ts                # Real-time event publisher & dispatcher
│   │   └── data\                           # Static content & seed fixtures
│   └── models\                             # 17 Mongoose Data Models
├── public\                                 # High-resolution media, logos & icons
└── next.config.ts                          # Next.js 16 Turbopack & Cache configuration
```

---

## 4. Route Architecture & Rendering Strategy

Next.js 16 App Router utilizes Partial Prerendering (PPR) alongside Cache Components:
- **Public Marketing Pages (`/`, `/about-us`, `/our-product`, `/help`)**: Rendered using Partial Prerendering (`◐`). Static page shells are generated at build time, while personalized elements (e.g. user session badge in header, dynamic shopping cart drawer) are streamed via React Server Components.
- **Product Detail Pages (`/products/[slug]`)**: Pre-rendered at build time for known slugs (`basic`, `pro`, `enterprise`, etc.) with dynamic revalidation.
- **Transactional & Account Pages (`/account`, `/cart`, `/checkout`)**: Server Components guarded by `requireUserId()`. Unauthenticated requests redirect to login or trigger the modal authentication dialog.
- **Admin & Manager Dashboards (`/admin/*`, `/manager/*`)**: Server Components guarded by `requireRole(["super_admin"])` and `requireRole(["manager", "super_admin"])`. Server-side data fetching directly queries MongoDB via Mongoose, preventing unnecessary internal HTTP loopback calls.
- **API Routes (`/api/*`)**: Dynamically executed (`ƒ`) using request-time connection guarantees and strict role authorization guards via `checkApiRole()`.

---

## 5. Backend & Database Architecture

### Singleton Database Connection (`src/lib/mongodb.ts`)
MongoDB connection caching prevents connection exhaustion during serverless invocations and concurrent worker requests:
```ts
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
```

### 17 Core Data Models
1. **`User`**: Credentials, hashed passwords, roles (`customer`, `manager`, `admin`, `super_admin`), status (`active`, `suspended`).
2. **`Lead`**: Inbound institutional interest, assigned manager, lifecycle status (`new`, `assigned`, `contacted`, `qualified`, `converted`, `lost`), priority, contact history.
3. **`QuoteRequest`**: Customer quote requests, requested specifications, volume requirements, timeline, budget range.
4. **`Order`**: Authoritative checkout records, line items, customer details, fulfillment status, payment state, reference IDs (`ORD-YYYY-XXXX`).
5. **`Product`**: Commercial machine specifications, pricing tiers, accessories, stock levels, gallery images.
6. **`Institution`**: Educational, healthcare, industrial, and government client profiles.
7. **`Notification`**: Broadcast and targeted notifications, read receipts, priority levels.
8. **`AuditLog`**: Immutable action log recording operator ID, entity modified, action taken, and timestamp.
9. **`Cart`**: Server-persisted shopping carts for authenticated customers.
10. **`ContactMessage`**: Customer inquiries from the contact page.
11. **`Counter`**: Atomic sequence generator for human-readable IDs (`LEAD-XXXX`, `QUO-XXXX`, `ORD-XXXX`).
12. **`ServiceRequest`**: Equipment warranty, scheduled servicing, and maintenance tickets.
13. **`Inventory`**: Warehouse stock levels, batch tracking, reorder thresholds.
14. **`FaqItem`**: Categorized help center articles and technical documentation.
15. **`PasswordResetToken`**: Secure hashed tokens for password recovery.
16. **`PolicyPage`**: Editable legal policies (Privacy Policy, Terms, Warranty).
17. **`SiteSetting`**: Key-value operational configurations (maintenance mode, announcement banner).

---

## 6. Authentication & Access Control (RBAC)

Authentication is handled via NextAuth v5 (Auth.js) using JWT strategy:
- **Customer Realm**: Authenticates via `/login`, `/create-account`, or the client-side `<AuthModal />`. Role is enforced as `customer`. If a staff member attempts customer login, the system strictly separates their portal and blocks dashboard leakage.
- **Staff Realm**: Dedicated `/admin/login` portal for `manager`, `admin`, and `super_admin` personnel.
- **Server Guarding**:
  - `requireUserId()`: Ensures valid user session or triggers redirect.
  - `requireRole(["super_admin"])`: Strict route guard for Super Admin pages.
  - `requireRole(["manager", "super_admin"])`: Multi-role route guard for operational dashboards.
  - `checkApiRole()`: API route guard enforcing session claims and providing real-time MongoDB fallback verification in case of stale JWT tokens.

---

## 7. Real-Time Notification & Quote Lifecycle

1. **Submission**: User submits a quote request on `/institutional-quote`.
2. **Atomic Ingestion**: `/api/quote-requests` creates both a `QuoteRequest` record and an actionable `Lead` record in MongoDB, atomically incrementing human-readable sequence counters.
3. **Event Dispatch**: `publishNotification()` writes to the `Notification` collection and broadcasts an SSE event through the active `NotificationStream`.
4. **Client Reception**: The `useDesktopNotifications` hook on Manager and Admin screens:
   - Receives the SSE event instantly.
   - Triggers the synthesized audio chime (`playChime()`).
   - Displays a native OS Web Notification (if permission is granted).
   - Updates the live unread badge and notification drawer without page refresh.

---

## 8. Current Technical Risks & Mitigations

| Identified Risk | Severity | Implemented Mitigation |
|---|---|---|
| **Stale JWT Role Escalation** | High | `checkApiRole()` checks JWT claim first, then verifies directly against MongoDB `User.findById()` if permission does not match. |
| **Prerender Dynamic Exception** | Medium | Next.js 16 `cacheComponents` dynamic control-flow exceptions are rethrown in API catch blocks, ensuring clean builds. |
| **Connection Exhaustion** | Medium | Mongoose connection caching via `global.mongoose` ensures a single pool is reused across requests. |
| **Notification Loss on Refresh** | Low | SSE stream is paired with initial REST `/api/notifications` fetch, ensuring all missed notifications are loaded upon page reload. |

---
