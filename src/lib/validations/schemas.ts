import { z } from "zod";
import { CONTACT_MODELS, ENQUIRY_TYPES, INSTITUTION_TYPES, QUOTE_MODELS } from "@/lib/enums";
import { email, optionalText, password, phone, text } from "./common";

/* ---------- Institutional quote ---------- */
export const quoteRequestSchema = z.object({
  organizationName: text("Organization name"),
  institutionType: z.enum(INSTITUTION_TYPES, { error: "Select an institution type" }),
  contactPerson: text("Contact person"),
  role: optionalText(),
  email,
  phone: optionalText(20).pipe(phone.optional()),
  preferredModel: z.enum(QUOTE_MODELS, { error: "Select a model" }),
  quantity: z.coerce.number({ error: "Enter a quantity" }).int("Enter a whole number").min(1, "At least 1").max(10000),
  expectedDailyUsage: text("Expected daily usage"),
  deliveryCityPostal: text("Delivery city & postal code"),
  useCase: text("Use case & number of locations", 2000),
  installationRequirements: text("Installation requirements", 2000),
  consent: z.literal(true, { error: "Please agree to be contacted" }),
});
export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequestData = z.output<typeof quoteRequestSchema>;

/* ---------- Contact ---------- */
export const contactSchema = z.object({
  name: text("Full name"),
  email,
  phone: optionalText(20).pipe(phone.optional()),
  enquiryType: z.enum(ENQUIRY_TYPES, { error: "Choose Sales or Service" }),
  model: z
    .enum([...CONTACT_MODELS, ""])
    .optional()
    .transform((v) => v || undefined),
  orderReference: optionalText(40),
  message: text("Message", 2000),
  consent: z.literal(true, { error: "Please agree to be contacted" }),
});
export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

/* ---------- Auth ---------- */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.input<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: text("Full name"),
    email,
    organization: optionalText(),
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.literal(true, { error: "Please accept the Terms & Conditions" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterInput = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

/* ---------- Account ---------- */
export const profileSchema = z.object({
  name: text("Full name"),
  organization: optionalText(),
  phone: optionalText(20).pipe(phone.optional()),
});
export type ProfileInput = z.input<typeof profileSchema>;

export const addressSchema = z.object({
  organization: text("Organization"),
  recipient: optionalText(),
  department: optionalText(),
  street: text("Street address"),
  line2: optionalText(),
  city: text("City"),
  state: text("State"),
  postalCode: text("Postal code", 12),
  country: text("Country"),
});
export type AddressInput = z.input<typeof addressSchema>;

export const addressesUpdateSchema = z.object({
  shippingAddress: addressSchema.optional(),
  billingSameAsShipping: z.boolean().optional(),
  billingAddress: addressSchema.optional(),
});
export type AddressesUpdateInput = z.input<typeof addressesUpdateSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

/* ---------- Cart ---------- */
export const cartAddSchema = z.object({ slug: z.string().min(1).max(40) });
export const cartUpdateSchema = z.object({
  slug: z.string().min(1).max(40),
  quantity: z.number().int().min(0).max(999), // 0 = remove
});

/* ---------- Checkout ---------- */
export const PAYMENT_METHODS = ["Online payment · example selection"] as const;

export const checkoutSchema = z
  .object({
    fullName: text("Full name"),
    email,
    phone: text("Phone for delivery", 20).pipe(phone),
    organization: text("Organization / institution"),
    department: text("Department / recipient"),
    street: text("Street address"),
    line2: optionalText(),
    city: text("City"),
    state: text("State", 60).pipe(z.string().min(1)),
    postalCode: text("Postal code", 12),
    country: text("Country"),
    notes: optionalText(1000),
    billingSameAsShipping: z.boolean(),
    billingOrganization: optionalText(),
    poReference: optionalText(),
    paymentMethod: z.enum(PAYMENT_METHODS, { error: "Select a payment method" }),
    terms: z.literal(true, { error: "Please accept the Terms & Conditions" }),
  })
  .superRefine((v, ctx) => {
    if (!v.billingSameAsShipping && !v.billingOrganization) {
      ctx.addIssue({ code: "custom", path: ["billingOrganization"], message: "Billing organization is required" });
    }
  });
export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;
