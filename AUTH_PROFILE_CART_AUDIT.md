# RMAX Solutions — Authentication, Profile & Cart Audit

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  

---

## 1. Authentication Architecture (NextAuth v5 / Auth.js)

### Session & Token Mechanics
- **Strategy:** JWT stored in secure HTTP-only cookie (`authjs.session-token`).
- **Secret Encryption:** Configured via `AUTH_SECRET` environment variable with HMAC signing.
- **Session Duration:** 30 days rolling expiration with silent refresh on activity.
- **Password Security:** Salted bcrypt hashing (12 cost factor) executed in `src/lib/actions/auth.ts`. Plaintext passwords are never logged, stored, or returned in API responses.

---

## 2. Customer Authentication Modal & Form Sanitation

- **Modal Architecture:** Driven by `AuthModalContext` and `<CustomerAuthModal />`, accessible across all public pages without losing user scroll position or page state.
- **Route Redirection:** Visiting `/login` or `/create-account` gracefully redirects to `/?auth=login` or `/?auth=register`, opening the modal dialog seamlessly.
- **Scroll Locking:** When the auth modal opens, both `document.body` and `document.documentElement` have `overflow: hidden` applied, accompanied by the `GlobalModalScrollLock` observer, preventing any background website scrolling.
- **Credential Sanitation:** Error messages return `"User not found or invalid credentials."` uniformly to prevent user and staff role enumeration.
- **Statutory Agreement:** The login tab includes clear agreement notices linking directly to `/terms-and-conditions` and `/privacy-policy`.

---

## 3. Shopping Cart Architecture

- **State Persistence:** `CartContext` maintains cart items in client local storage, synchronizing with the server `/api/cart` endpoint.
- **Price Integrity:** Client items submitted to `/checkout` or `/api/orders` are re-priced authoritatively against MongoDB `Product` records on the server. Client-submitted prices are discarded.
- **Stock Validation:** Out-of-stock items or quantities exceeding warehouse availability trigger automatic revalidation and clear user alerts before payment.

---
