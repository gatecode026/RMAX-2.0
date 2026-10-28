# RMAX Solutions — Role-Based Access Control (RBAC) & Security Audit

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  

---

## 1. Access Control Matrix & Realm Isolation

RMAX Solutions operates two distinct authentication and authorization realms to enforce strict isolation between commercial consumers and internal operational staff:

```text
Authentication Realms
├── Customer Realm
│   ├── Entry: Header Account Button, /?auth=login, /create-account
│   ├── Target Role: "customer"
│   └── Authorized Scope: /account, /cart, /checkout, /order-confirmation/*
└── Staff Realm
    ├── Entry: /admin/login
    ├── Target Roles: "manager", "admin", "super_admin"
    └── Authorized Scope:
        ├── Manager: /manager/dashboard, /manager/leads, /manager/quotations, /manager/follow-ups
        └── Super Admin: /admin/* (Full enterprise access)
```

---

## 2. Server-Side Guard Implementation

### Server Components (`src/lib/session.ts`)
- `requireRole(["super_admin", "admin"])`:
  Evaluates session JWT server-side. Unauthenticated users are redirected to `/admin/login`. Unauthorized users (e.g. `customer` or `manager` trying to view `/admin/users`) are redirected or rejected with 403 Forbidden.
- `requireRole(["manager", "super_admin"])`:
  Permits both operational Managers and Super Admins to access operational workspaces.

### REST Endpoints (`checkApiRole`)
- Evaluates NextAuth JWT payload on incoming request.
- **Dynamic Re-verification:** If the JWT contains a non-privileged claim, it queries MongoDB `User.findById()` directly to detect recently updated promotions or demotions, preventing session spoofing.

---

## 3. IDOR & Cross-User Data Protection

1. **Manager Lead Scoping:**
   Managers query `/api/manager/leads` or view `/manager/leads/[id]`. The query enforces:
   ```ts
   if (!isSuperAdmin) {
     baseQuery.$or = [
       { assignedManager: user.id },
       { assignedManager: null },
       { assignedManager: { $exists: false } },
     ];
   }
   ```
   A manager cannot inspect leads assigned to another manager.
2. **Customer Order Scoping:**
   Customers query `/api/orders` or `/api/account/orders`. The query enforces `customerId: session.user.id`. Direct requests for other order reference IDs return 404 or 403.
3. **Customer Form Sanitation:**
   Staff account credentials entered on customer forms return generic `"User not found or invalid credentials."`, mitigating user enumeration attacks.

---
