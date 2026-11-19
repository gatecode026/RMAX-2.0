/**
 * Manager page/action permissions. Shared by server and client (no server-only imports).
 *
 * Page switches (`*View`) gate a page; action switches only mean something while their page is on,
 * so every read goes through `normalizePermissions`, which clears actions whose page is off.
 */
export const PERMISSION_KEYS = [
  "dashboardView",
  "leadsView",
  "leadsEdit",
  "leadsAssign",
  "customersView",
  "customersEdit",
  "productsView",
  "productsDelete",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type ManagerPermissions = Record<PermissionKey, boolean>;

/** The page each action belongs to. Page switches have no parent. */
export const PERMISSION_PARENT: Partial<Record<PermissionKey, PermissionKey>> = {
  leadsEdit: "leadsView",
  leadsAssign: "leadsView",
  customersEdit: "customersView",
  productsDelete: "productsView",
};

/** Admin-panel layout: one group per page. */
export const PERMISSION_GROUPS: { page: PermissionKey; title: string; description: string; actions: { key: PermissionKey; label: string }[] }[] = [
  { page: "dashboardView", title: "Manager Dashboard", description: "Overview of leads and follow-ups.", actions: [] },
  {
    page: "leadsView",
    title: "Lead Management",
    description: "Leads, quotations and follow-ups.",
    actions: [
      { key: "leadsEdit", label: "Edit lead" },
      { key: "leadsAssign", label: "Assign / reassign lead" },
    ],
  },
  { page: "customersView", title: "Customer Management", description: "Customer directory.", actions: [{ key: "customersEdit", label: "Edit customer" }] },
  { page: "productsView", title: "Product Management", description: "Product catalogue.", actions: [{ key: "productsDelete", label: "Delete products" }] },
];

/**
 * What every manager could do before permissions existed: the dashboard and lead pages, with
 * lead editing (but not reassignment, which was Super Admin only). Customers and products had
 * no manager pages, so they start off.
 */
export const LEGACY_MANAGER_PERMISSIONS: ManagerPermissions = {
  dashboardView: true,
  leadsView: true,
  leadsEdit: true,
  leadsAssign: false,
  customersView: false,
  customersEdit: false,
  productsView: false,
  productsDelete: false,
};

/** Fill gaps from `base` (legacy defaults for managers without a saved record) and enforce page → action dependency. */
export function normalizePermissions(saved?: Partial<Record<string, unknown>> | null, base: ManagerPermissions = LEGACY_MANAGER_PERMISSIONS): ManagerPermissions {
  const out = {} as ManagerPermissions;
  for (const k of PERMISSION_KEYS) {
    out[k] = typeof saved?.[k] === "boolean" ? (saved[k] as boolean) : base[k];
  }
  for (const [action, page] of Object.entries(PERMISSION_PARENT) as [PermissionKey, PermissionKey][]) {
    if (!out[page]) out[action] = false;
  }
  return out;
}

/** Manager pages in sidebar order, each guarded by one permission. Profile is always allowed. */
export const MANAGER_PAGES: { label: string; href: string; permission: PermissionKey | null }[] = [
  { label: "Dashboard", href: "/manager/dashboard", permission: "dashboardView" },
  { label: "My Leads", href: "/manager/leads", permission: "leadsView" },
  { label: "Quotations", href: "/manager/quotations", permission: "leadsView" },
  { label: "Follow-Ups", href: "/manager/follow-ups", permission: "leadsView" },
  { label: "Customers", href: "/manager/customers", permission: "customersView" },
  { label: "Products", href: "/manager/products", permission: "productsView" },
  { label: "My Profile", href: "/manager/profile", permission: null },
];

export function allowedManagerPages(p: ManagerPermissions) {
  return MANAGER_PAGES.filter((pg) => !pg.permission || p[pg.permission]);
}

/** Path → the page entry that owns it (longest-prefix), or undefined for unknown paths. */
export function pageForPath(pathname: string) {
  const path = pathname === "/manager" ? "/manager/dashboard" : pathname;
  return MANAGER_PAGES.find((pg) => path === pg.href || path.startsWith(`${pg.href}/`));
}

/** First page this manager may open (Profile always qualifies). */
export function firstAllowedHref(p: ManagerPermissions) {
  return allowedManagerPages(p)[0].href;
}

export function canAccessPath(p: ManagerPermissions, pathname: string) {
  const pg = pageForPath(pathname);
  return !pg || !pg.permission || p[pg.permission];
}
