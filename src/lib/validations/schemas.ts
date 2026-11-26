import { z } from "zod";
import { capitalizeWords } from "@/lib/input-format";
import { CONTACT_MODELS, ENQUIRY_TYPES, INSTITUTION_TYPES } from "@/lib/enums";
import { cleanText, email, optionalName, optionalText, password, phone, pincode, properName, text } from "./common";

/* ---------- Institutional quote ---------- */
export const quoteRequestSchema = z.object({
  organizationName: properName("Organization name", 150),
  institutionType: z.enum(INSTITUTION_TYPES, { error: "Select an institution type" }),
  contactPerson: z
    .string({ error: "Contact person is required" })
    .transform((v) => capitalizeWords(cleanText(v)))
    .pipe(z.string().min(2, "Contact person name is required").max(100)),
  role: optionalName(80),
  email,
  phone,
  // Any published product slug (or "help-me-choose"); existence is checked against the DB in the API route.
  preferredModel: z.string({ error: "Select a model" }).trim().min(1, "Select a model").max(100),
  quantity: z.coerce
    .number({ error: "Enter a quantity" })
    .int("Enter a whole number")
    .min(1, "At least 1 unit is required")
    .max(10000, "Quantity cannot exceed 10,000"),
  expectedDailyUsage: text("Expected daily usage", 100),
  deliveryCityPostal: text("Delivery city & postal code", 100),
  useCase: optionalText(2000),
  installationRequirements: optionalText(2000),
  consent: z.literal(true, { error: "Please agree to be contacted" }),
  websiteUrl: z.string().optional(),
});
export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequestData = z.output<typeof quoteRequestSchema>;

/* ---------- Contact ---------- */
export const contactSchema = z.object({
  name: z
    .string({ error: "Full name is required" })
    .transform((v) => capitalizeWords(cleanText(v)))
    .pipe(
      z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .regex(/^[a-zA-Z\s.'-]+$/, "Name should only contain letters and standard characters")
    ),
  email,
  phone,
  enquiryType: z.enum(ENQUIRY_TYPES, { error: "Please select either Sales or Service" }),
  model: z
    .enum([...CONTACT_MODELS, ""])
    .optional()
    .transform((v) => v || undefined),
  orderReference: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : cleanText(v)))
    .pipe(
      z
        .string()
        .max(40, "Order reference cannot exceed 40 characters")
        .regex(/^[A-Za-z0-9\-_#\s/]*$/, "Order reference contains invalid characters")
        .optional()
    )
    .transform((v) => (v ? v : undefined)),
  message: z
    .string({ error: "Message is required" })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(10, "Please enter at least 10 characters describing your enquiry")
        .max(2000, "Message cannot exceed 2000 characters")
    ),
  consent: z.literal(true, { error: "Please agree to be contacted to submit your message" }),
  // Anti-bot honeypot
  websiteUrl: z.string().optional(),
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
    name: properName("Full name"),
    email,
    phone,
    organization: optionalName(),
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

export const resetPasswordSchema = z
  .object({
    email,
    otp: z.string({ error: "Enter the 6-digit code" }).trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

/* ---------- Account ---------- */
export const profileSchema = z.object({
  name: properName("Full name"),
  organization: optionalName(),
  phone: phone.optional(),
});
export type ProfileInput = z.input<typeof profileSchema>;

export const addressSchema = z.object({
  organization: properName("Organization"),
  recipient: optionalName(),
  department: optionalName(),
  street: text("Street address"),
  line2: optionalText(),
  city: properName("City"),
  state: properName("State", 60),
  postalCode: pincode,
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
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "New password cannot be the same as your current password",
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

/* ---------- Cart ---------- */
export const cartAddSchema = z.object({ slug: z.string().min(1).max(100), quantity: z.number().int().min(1).max(5).optional() });
export const cartUpdateSchema = z.object({
  slug: z.string().min(1).max(100),
  quantity: z.number().int().min(0).max(5), // 0 = remove
});

/* ---------- Checkout ---------- */
export const PAYMENT_METHODS = ["Cash on Delivery (COD)", "Online payment"] as const;

export const checkoutSchema = z
  .object({
    fullName: properName("Full name"),
    email,
    phone: text("Phone for delivery", 20).pipe(phone),
    organization: properName("Organization / institution", 150),
    department: optionalName(),
    street: text("Street address"),
    line2: optionalText(),
    city: properName("City"),
    state: properName("State", 60),
    postalCode: pincode,
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
