/** Live input formatting shared by every form (see InputFormatter). Pure functions, no DOM. */

/** Indian mobile while typing: digits only, optional leading "+", and an optional 91 / +91 / 0 prefix. */
export function formatPhoneInput(raw: string): string {
  const plus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  const max = plus ? 12 : digits.startsWith("91") && digits.length > 10 ? 12 : digits.startsWith("0") ? 11 : 10;
  return (plus ? "+" : "") + digits.slice(0, max);
}

/** Upper-cases the first letter of every word; the rest is left as typed ("rmax solutions" → "Rmax Solutions", "RMAX" stays). */
export function capitalizeWords(v: string): string {
  return v.replace(/(^|[\s\-'.(/&])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** Emails have no spaces and no capitals. */
export const formatEmailInput = (v: string) => v.replace(/\s/g, "").toLowerCase();

/** Field names / autocomplete tokens whose value is a person, company or place name. */
const NAME_FIELD = /^(name|fullname|full_name|contactperson|recipient|organi[sz]ation(name)?|company(name)?|institutionname|department|city|state|role|billingorganization|firstname|lastname|managername)$/i;
const NAME_AUTOCOMPLETE = /^(name|given-name|family-name|organization|organization-title|address-level2|address-level1)$/;

/** Returns the formatter for an input, or undefined when the field needs none. */
export function formatterFor(el: HTMLInputElement): ((v: string) => string) | undefined {
  if (el.readOnly || el.disabled) return undefined;
  if (el.type === "tel" || /(^|_|-)(phone|mobile)$/i.test(el.name) || /^(phone|mobile)/i.test(el.name)) return formatPhoneInput;
  if (el.type === "email") return formatEmailInput;
  if (el.type === "text" && (NAME_FIELD.test(el.name) || NAME_AUTOCOMPLETE.test(el.autocomplete))) return capitalizeWords;
  return undefined;
}
