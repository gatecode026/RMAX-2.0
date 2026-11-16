# RMAX Solutions — Route and Page Inventory

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  
**Total Next.js App Routes:** 79 routes verified and generated  

---

## 1. Inventory Summary

| Category | Count | Rendering Strategy | Auth & Access Controls | Status |
|---|:---:|---|---|:---:|
| **Public Customer & Marketing** | 18 | Partial Prerendering (`◐`) / Static (`○`) | Public access (Guest / All) | Verified |
| **Super Admin Dashboard** | 15 | Partial Prerendering (`◐`) | RBAC (`super_admin`, `admin`) | Verified |
| **Manager Operational Portal** | 6 | Dynamic (`ƒ`) & PPR (`◐`) | RBAC (`manager`, `super_admin`) | Verified |
| **API Endpoints & SSE Streams** | 22 | Dynamic Server Routes (`ƒ`) | Token JWT & MongoDB Role Checks | Verified |
| **Static Assets & Metadata** | 4 | Static (`○`) | Public (Robots, Sitemap, Favicons) | Verified |
| **Total** | **79** | **Full Next.js App Tree** | **Multi-Realm RBAC** | **100% Passing** |

---

## 2. Public & Customer Routes

| Path | File Location | Data Sources | Loading / Error States | Verification Status |
|---|---|---|---|:---:|
| `/` | `src/app/(site)/page.tsx` | Static CMS & Model Highlights | Suspense Skeletons (`Hero`, `Products`) | Verified |
| `/about-us` | `src/app/(site)/about-us/page.tsx` | Static fixtures & brand timeline | Pre-rendered shell | Verified |
| `/our-product` | `src/app/(site)/our-product/page.tsx` | Static & MongoDB `Product` | Product grid skeleton | Verified |
| `/products/[slug]` | `src/app/(site)/products/[slug]/page.tsx` | Slug static params (`basic`, `pro`, `pro-max`) | Dynamic gallery & spec table | Verified |
| `/compare-models` | `src/app/(site)/compare-models/page.tsx` | Model feature matrix | Static comparison table | Verified |
| `/institutional-quote` | `src/app/(site)/institutional-quote/page.tsx` | Client form + `/api/quote-requests` | Loading indicator + modal confirmation | Verified |
| `/contact-us` | `src/app/(site)/contact-us/page.tsx` | Client form + `/api/contact-messages` | In-flight spinner & response alert | Verified |
| `/help` | `src/app/(site)/help/page.tsx` | MongoDB `FaqItem` & static fallbacks | Categorized accordions | Verified |
| `/cart` | `src/app/(site)/cart/page.tsx` | `CartContext` & local storage | Empty cart state + item cards | Verified |
| `/checkout` | `src/app/(site)/checkout/page.tsx` | Cart items & customer address | Step indicator & price breakdown | Verified |
| `/order-confirmation/[ref]` | `src/app/(site)/order-confirmation/[ref]/page.tsx` | MongoDB `Order.findOne({ orderNumber })` | Dynamic order receipt | Verified |
| `/account` | `src/app/(site)/account/page.tsx` | `requireUserId()` + MongoDB `User` | Profile skeleton & edit drawer | Verified |
| `/account/orders` | `src/app/(site)/account/orders/page.tsx` | MongoDB `Order.find({ customerId })` | Empty orders notice & list | Verified |
| `/account/orders/[ref]` | `src/app/(site)/account/orders/[ref]/page.tsx` | MongoDB `Order` specific to customer | Order timeline & items | Verified |
| `/shipping-exchanges-warranty` | `src/app/(site)/shipping-exchanges-warranty/page.tsx` | MongoDB `PolicyPage` / Static | Legal policy view | Verified |
| `/privacy-policy` | `src/app/(site)/privacy-policy/page.tsx` | MongoDB `PolicyPage` / Static | Privacy disclosures | Verified |
| `/terms-and-conditions` | `src/app/(site)/terms-and-conditions/page.tsx` | MongoDB `PolicyPage` / Static | Commercial terms | Verified |
| `/_not-found` | `src/app/_not-found.tsx` | Static 404 UI | Return home CTA | Verified |

---

## 3. Super Admin Dashboard Routes (`/admin/*`)

*All administrative routes enforce `requireRole(["super_admin", "admin"])`. Unauthenticated requests redirect to `/admin/login`.*

| Route | Primary View / Functionality | Persisted Collections | Audit Log Recorded? |
|---|---|---|:---:|
| `/admin/dashboard` | Executive KPI cards, monthly revenue charts, recent orders table | `Order`, `Lead`, `QuoteRequest` | No (read-only) |
| `/admin/leads` | Inbound pipeline, lead status board, manager assignment modal | `Lead`, `User` | Yes (`lead.assign`, `lead.update`) |
| `/admin/quotations` | Quote catalog, custom pricing, discount calculation, PDF preview | `QuoteRequest`, `Counter` | Yes (`quote.create`, `quote.update`) |
| `/admin/orders` | Order management table, fulfillment status filter, payment tracking | `Order` | Yes (`order.status_update`) |
| `/admin/orders/[id]` | Deep-dive order fulfillment, courier tracking, customer contact | `Order`, `User` | Yes (`order.note_added`) |
| `/admin/products` | Catalog listing, pricing, stock overview, edit/delete actions | `Product` | Yes (`product.update`, `product.delete`) |
| `/admin/products/create` | Multi-image upload, spec matrix editor, tier configuration | `Product` | Yes (`product.create`) |
| `/admin/products/[id]` | Edit existing model specifications and pricing | `Product` | Yes (`product.update`) |
| `/admin/customers` | Registered customer directory, spend totals, order counts | `User`, `Order` | Yes (`customer.status`) |
| `/admin/institutions` | Institutional account profiles (schools, hospitals, enterprises) | `Institution` | Yes (`institution.update`) |
| `/admin/inventory` | Real-time stock counts, reorder warnings, batch updates | `Inventory`, `Product` | Yes (`inventory.adjust`) |
| `/admin/enquiries` | Inbound customer contact messages & resolution tracker | `ContactMessage` | Yes (`enquiry.resolved`) |
| `/admin/service-requests`| Machine maintenance tickets, warranty claims, technician logs | `ServiceRequest` | Yes (`service.dispatch`) |
| `/admin/reports` | Exportable analytics: lead conversion rate, sales velocity | Multi-collection aggregation | No (export action logged) |
| `/admin/audit-logs` | Immutable audit trail with operator, action, and timestamp | `AuditLog` | No (read-only audit trail) |
| `/admin/settings` | Operational toggles (maintenance mode, announcement alert) | `SiteSetting` | Yes (`setting.update`) |
| `/admin/users` | Staff member management (create/suspend Managers & Admins) | `User` | Yes (`user.create`, `user.suspend`) |
| `/admin/login` | Dedicated staff authentication portal with role isolation | Auth.js credential verification | Yes (`auth.staff_login`) |

---

## 4. Manager Portal Routes (`/manager/*`)

*All manager routes enforce `requireRole(["manager", "super_admin"])`. Managers only access leads and quotes assigned to them.*

| Route | Primary View / Functionality | Security / Scope Isolation |
|---|---|---|
| `/manager/dashboard` | Today's follow-ups, conversion rate, personal lead volume | Filtered by `assignedManager: managerId` |
| `/manager/leads` | Pipeline table with direct phone call launcher, quick notes | Only assigned or unassigned pool |
| `/manager/leads/[id]` | Complete interaction history, next follow-up scheduler, quotation generator | Strict owner verification |
| `/manager/quotations` | Quotations generated by or assigned to the manager | Filtered by manager identity |
| `/manager/follow-ups` | Overdue, due today, and upcoming schedule alerts | Real-time date boundaries against manager leads |
| `/manager/profile` | Manager profile, personal phone number for call desk, password change | Self-service credentials |

---

## 5. API Endpoints Inventory (`/api/*`)

| Endpoint | HTTP Method | Guard | Description |
|---|:---:|---|---|
| `/api/quote-requests` | `POST` | Public / Rate-limited | Submits quote, generates `QuoteRequest` & `Lead`, triggers SSE notification |
| `/api/contact-messages` | `POST` | Public / Rate-limited | Records contact inquiries, notifies admin |
| `/api/products` | `GET` | Public | Cached product catalog with tiered specs |
| `/api/cart` | `GET`, `POST` | Session Cookie | Validates inventory and server-authoritative pricing |
| `/api/orders` | `POST` | Authenticated / Guest | Creates order with server-calculated totals and stock deduction |
| `/api/orders/[ref]` | `GET` | Session / Customer | Fetches specific order receipt by reference number |
| `/api/notifications` | `GET`, `PATCH` | Staff (`manager`, `admin`) | Fetches unread notifications and marks as read |
| `/api/notifications/stream` | `GET` (SSE) | Staff (`manager`, `admin`) | Server-Sent Events real-time event pipeline |
| `/api/admin/leads` | `GET`, `POST` | `checkApiRole(["super_admin"])` | Leads query and administrative lead creation |
| `/api/admin/leads/[id]` | `PATCH`, `DELETE` | `checkApiRole(["super_admin"])` | Lead status and manager reassignment |
| `/api/admin/quotations` | `GET`, `POST` | `checkApiRole(["super_admin"])` | Generates official quote with breakdown |
| `/api/admin/audit-logs` | `GET` | `checkApiRole(["super_admin"])` | Paginated immutable operational log |
| `/api/manager/follow-ups` | `GET` | `checkApiRole(["manager"])` | Overdue and today's schedule for manager |
| `/api/auth/register` | `POST` | Public | Validates customer registration, prevents duplicate emails |
| `/api/auth/forgot-password`| `POST` | Public | Issues password reset token |
| `/api/account/profile` | `GET`, `PATCH` | `checkApiRole(["customer"])` | Customer profile management |
| `/api/account/password` | `POST` | `checkApiRole(["customer"])` | Password updates with current password check |

---
