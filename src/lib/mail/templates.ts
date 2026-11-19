import "server-only";
import type { INotificationJob } from "@/models/NotificationJob";

/** Branded, mobile-friendly HTML + plain-text emails. Every dynamic value is HTML-escaped. */
export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}
type Payload = Record<string, unknown>;

const NAVY = "#002970";
const CANVAS = "#FBF9F5";
const CHARCOAL = "#232A32";
const MUTED = "#586574";
const LINE = "#D6DCE4";

export const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const s = (v: unknown, fallback = "—") => {
  const t = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
  // Single line: stops header-injection style tricks in subjects and keeps rows tidy.
  return t ? t.replace(/[\r\n]+/g, " ").slice(0, 300) : fallback;
};
const inr = (n: unknown) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

type Row = [label: string, value: string];

function layout(opts: { preheader: string; heading: string; intro: string; rows: Row[]; button?: { label: string; href: string }; footer: string }) {
  const rows = opts.rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:${MUTED};font-size:13px;width:38%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 0;color:${CHARCOAL};font-size:14px;font-weight:600;vertical-align:top;word-break:break-word">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const button = opts.button
    ? `<p style="margin:24px 0 4px"><a href="${escapeHtml(opts.button.href)}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px">${escapeHtml(opts.button.label)}</a></p>`
    : "";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:${CANVAS};font-family:Manrope,Segoe UI,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FDFDFD;border:1px solid ${LINE};border-radius:20px;overflow:hidden">
<tr><td style="background:${NAVY};padding:20px 28px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">RMAX Solutions</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 8px;color:${CHARCOAL};font-size:22px;line-height:30px;font-weight:800">${escapeHtml(opts.heading)}</h1>
<p style="margin:0 0 18px;color:${MUTED};font-size:14px;line-height:22px">${escapeHtml(opts.intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};border-bottom:1px solid ${LINE}">${rows}</table>
${button}
</td></tr>
<tr><td style="padding:16px 28px 24px;color:${MUTED};font-size:12px;line-height:18px;border-top:1px solid ${LINE}">${escapeHtml(opts.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [opts.heading, "", opts.intro, "", ...opts.rows.map(([k, v]) => `${k}: ${v}`), ...(opts.button ? ["", `${opts.button.label}: ${opts.button.href}`] : []), "", opts.footer].join("\n");
  return { html, text };
}

export interface RenderContext {
  appUrl: string;
  supportEmail: string;
}

/** Dashboard link for the recipient. Managers get the record page; the existing permission guards still decide access. */
function dashboardLink(job: Pick<INotificationJob, "event" | "recipientType" | "entityId">, ctx: RenderContext) {
  const base = ctx.appUrl;
  const admin = job.recipientType === "admin";
  if (job.event === "order_confirmed") return admin ? `${base}/admin/orders` : null; // managers have no orders page
  if (job.event === "quotation_created") return `${base}${admin ? "/admin/quotations" : "/manager/quotations"}`;
  return admin ? `${base}/admin/leads` : `${base}/manager/leads/${encodeURIComponent(job.entityId)}`;
}

const EVENT_LABEL: Record<string, string> = {
  lead_created: "New lead",
  quotation_created: "New quotation request",
  lead_assigned: "Lead assigned to you",
  order_confirmed: "Order confirmed",
};

function renderInternal(job: INotificationJob, ctx: RenderContext): RenderedMail {
  const p = job.payload as Payload;
  const label = EVENT_LABEL[job.event];
  const link = dashboardLink(job, ctx);
  let ref = "";
  let rows: Row[] = [];
  let intro = "";

  if (job.event === "order_confirmed") {
    ref = s(p.reference);
    const items = (Array.isArray(p.items) ? p.items : []) as Payload[];
    rows = [
      ["Order number", ref],
      ["Customer", s(p.customerName)],
      ["Email", s(p.email)],
      ["Phone", s(p.phone)],
      ["Items", items.map((i) => `${s(i.variantLabel, "") || s(i.title)} × ${s(i.quantity)}`).join("; ") || "—"],
      ["Total", inr(p.total)],
      ["Payment", s(p.paymentStatusLabel)],
      ["Deliver to", s(p.deliveryCity)],
    ];
    intro = `Order ${ref} has been confirmed.`;
  } else if (job.event === "quotation_created") {
    ref = s(p.quoteNumber);
    rows = [
      ["Quotation", ref],
      ...(p.leadNumber ? ([["Linked lead", s(p.leadNumber)]] as Row[]) : []),
      ["Organisation", s(p.organizationName)],
      ["Contact", s(p.contactPerson)],
      ["Email", s(p.email)],
      ["Phone", s(p.phone)],
      ["Product", s(p.preferredModel)],
      ["Quantity", s(p.quantity)],
      ["Delivery", s(p.deliveryCityPostal)],
      ["Assigned to", s(p.assignedManagerName, "Unassigned")],
    ];
    intro = `A new quotation request ${ref} was submitted.`;
  } else {
    ref = s(p.leadNumber);
    rows = [
      ["Lead", ref],
      ["Name", s(p.name)],
      ["Institution", s(p.institution)],
      ["Email", s(p.email)],
      ["Phone", s(p.phone)],
      ["Product", s(p.preferredModel)],
      ["Source", s(p.source)],
      ["Assigned to", s(p.assignedManagerName, "Unassigned")],
      ...(job.event === "lead_assigned" ? ([["Assigned by", s(p.assignedBy)]] as Row[]) : []),
    ];
    intro = job.event === "lead_assigned" ? `Lead ${ref} has been assigned to you.` : `A new lead ${ref} was saved.`;
  }

  const subject = `[RMAX] ${label}: ${ref}`;
  const { html, text } = layout({
    preheader: `${label} ${ref}`,
    heading: `${label} — ${ref}`,
    intro,
    rows,
    button: link ? { label: "Open in dashboard", href: link } : undefined,
    footer: "Internal RMAX notification. You are receiving this because of your role at RMAX Solutions. Sign-in and existing permissions apply to the dashboard.",
  });
  return { subject, html, text };
}

function renderCustomer(job: INotificationJob, ctx: RenderContext): RenderedMail {
  const p = job.payload as Payload;
  const support = ctx.supportEmail;
  const footer = `Questions? Reply to this email or write to ${support}.`;

  if (job.event === "order_confirmed") {
    const ref = s(p.reference);
    const items = (Array.isArray(p.items) ? p.items : []) as Payload[];
    const rows: Row[] = [
      ["Order number", ref],
      ...items.map((i): Row => [s(i.variantLabel, "") || s(i.title), `${s(i.quantity)} × ${inr(i.unitPrice)}${i.specLine ? ` — ${s(i.specLine)}` : ""}`]),
      ["Subtotal", inr(p.subtotal)],
      ["Shipping", inr(p.shipping)],
      ["Total", inr(p.total)],
      ["Payment", s(p.paymentStatusLabel)],
      ["Delivery to", s(p.deliveryCity)],
    ];
    const { html, text } = layout({
      preheader: `Your RMAX order ${ref} is confirmed`,
      heading: "Your order is confirmed",
      intro: `Hi ${s(p.customerName, "there")}, thank you for your order. Here are the details we have saved.`,
      rows,
      footer,
    });
    return { subject: `Your RMAX order ${ref} is confirmed`, html, text };
  }

  const isQuote = job.event === "quotation_created";
  const ref = s(isQuote ? p.quoteNumber : p.leadNumber);
  const { html, text } = layout({
    preheader: `We received your enquiry ${ref}`,
    heading: "Thank you — we received your enquiry",
    intro: `Hi ${s(isQuote ? p.contactPerson : p.name, "there")}, thanks for contacting RMAX Solutions. Our team will get back to you shortly. Please quote your reference if you write to us.`,
    rows: [
      ["Enquiry reference", ref],
      ...(isQuote ? ([["Product", s(p.preferredModel)], ["Quantity", s(p.quantity)]] as Row[]) : []),
    ],
    footer,
  });
  return { subject: `We received your enquiry ${ref} — RMAX Solutions`, html, text };
}

export function renderJobEmail(job: INotificationJob, ctx: RenderContext): RenderedMail {
  return job.recipientType === "customer" ? renderCustomer(job, ctx) : renderInternal(job, ctx);
}

/** Password-reset code email (standalone: it is never built from a stored job payload). */
export function renderOtpEmail(opts: { code: string; accountLabel: string; ttlMinutes: number }): RenderedMail {
  const { html, text } = layout({
    preheader: "Your RMAX password reset code",
    heading: "Your password reset code",
    intro: `Use this code to reset the password of your RMAX ${opts.accountLabel} account. It expires in ${opts.ttlMinutes} minutes and works once.`,
    rows: [["Reset code", opts.code]],
    footer: "If you did not ask to reset your password, ignore this email — your password stays as it is. Never share this code with anyone; RMAX staff will not ask for it.",
  });
  return { subject: "Your RMAX password reset code", html, text };
}
