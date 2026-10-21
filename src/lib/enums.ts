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
