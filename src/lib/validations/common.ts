import { z } from "zod";

/** Strip HTML tags and control characters, collapse surrounding whitespace. */
export function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export const text = (label: string, max = 200) =>
  z
    .string({ error: `${label} is required` })
    .transform(cleanText)
    .pipe(z.string().min(1, `${label} is required`).max(max, `${label} is too long`));

export const optionalText = (max = 200) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : cleanText(v)))
    .pipe(z.string().max(max, "Too long").optional())
    .transform((v) => (v ? v : undefined));

export const email = z
  .string({ error: "Email is required" })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Email is required")
      .max(254, "Email address is too long")
      .email("Enter a valid email address")
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email address (e.g. name@domain.com)")
  );

export const phone = z
  .string({ error: "Mobile number is required" })
  .transform((v) => cleanText(v).replace(/[\s\-\(\)]/g, ""))
  .transform((digits) => {
    if (digits.startsWith("+91")) return digits.slice(3);
    if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
    return digits;
  })
  .pipe(
    z
      .string()
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9)")
  );

export const password = z
  .string({ error: "Password is required" })
  .min(8, "Use at least 8 characters")
  .max(72, "Password is too long"); // bcrypt only uses the first 72 bytes

export type Infer<T extends z.ZodType> = z.infer<T>;
