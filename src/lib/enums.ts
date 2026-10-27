/** Shared enums — kept free of Mongoose so client components and Zod schemas can import them. */
export const ORDER_STATUSES = ["confirmed", "preparing", "dispatched", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const INSTITUTION_TYPES = ["Schools", "Offices", "Hospitals", "Hostels", "Public washrooms"] as const;
export const QUOTE_MODELS = ["basic", "pro", "pro-max", "help-me-choose"] as const;

/** Contact form: "choose Service on the contact form" (FAQ / Shipping policy copy). */
export const ENQUIRY_TYPES = ["Sales", "Service"] as const;
export const CONTACT_MODELS = ["basic", "pro", "pro-max"] as const;

export const FAQ_CATEGORIES = [
  "Operation",
  "Selection",
  "Installation",
  "Delivery",
  "Exchanges",
  "Warranty",
  "Service",
] as const;

/** User & Access Control roles */
export const USER_ROLES = ["super_admin", "admin", "manager", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "inactive"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Lead Management Enums */
export const LEAD_STATUSES = ["new", "assigned", "contacted", "qualified", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_SOURCES = [
  "institutional_quote",
  "contact_form",
  "website",
  "direct_call",
  "referral",
  "campaign",
  "manual",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const NOTIFICATION_TYPES = [
  "lead_created",
  "lead_assigned",
  "lead_reassigned",
  "lead_status_changed",
  "followup_due",
  "followup_overdue",
  "manager_action",
  "system",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

