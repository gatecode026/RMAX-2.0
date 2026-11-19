import "server-only";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Lead } from "@/models/Lead";
import { QuoteRequest } from "@/models/QuoteRequest";
import { Order } from "@/models/Order";
import { NotificationJob, type JobEvent, type RecipientType } from "@/models/NotificationJob";
import { getMailConfig, isEmail, type MailConfig } from "@/lib/mail/config";
import { getVariantLabel } from "@/lib/variant-label";
import { enqueueJobs, scheduleProcessing, type JobSpec } from "@/lib/mail/outbox";

/**
 * Event → recipients → persisted jobs. Every function here is safe to call from a request:
 * it never throws, and calling it twice for the same business event creates nothing new
 * (each job has a unique key made of event, record and recipient).
 */
type Id = string | Types.ObjectId;
const idStr = (v: Id) => String(v);
const low = (e: string) => e.trim().toLowerCase();

interface Managerish {
  email?: string;
  reason?: string;
}

/** The manager responsible for a record: the assigned manager's saved email, or the default manager when unassigned. */
async function resolveManager(assignedManagerId: Id | null | undefined, cfg: MailConfig): Promise<Managerish> {
  if (assignedManagerId) {
    const u = await User.findById(assignedManagerId).select("email status").lean();
    if (!u || u.status === "inactive") return { reason: "assigned_manager_inactive_or_missing" };
    if (!isEmail(u.email)) return { reason: "assigned_manager_has_no_valid_email" };
    return { email: u.email.trim() };
  }
  return cfg.defaultManagerEmail ? { email: cfg.defaultManagerEmail } : { reason: "no_default_manager_configured" };
}

/** Separate emails to Admin and Manager; if they resolve to one address, only the admin alert is sent. */
async function internalSpecs(base: Omit<JobSpec, "key" | "recipientType" | "to" | "skipReason">, cfg: MailConfig, assignedManagerId: Id | null | undefined): Promise<JobSpec[]> {
  const prefix = `${base.event}:${base.entityId}`;
  const specs: JobSpec[] = cfg.adminEmails.map((to) => ({ ...base, recipientType: "admin" as const, to, key: `${prefix}:admin:${low(to)}` }));

  const mgr = await resolveManager(assignedManagerId, cfg);
  if (mgr.email && cfg.adminEmails.some((a) => low(a) === low(mgr.email!))) {
    specs.push({ ...base, recipientType: "manager", to: mgr.email, key: `${prefix}:manager:${low(mgr.email)}`, skipReason: "same_address_as_admin" });
  } else if (mgr.email) {
    specs.push({ ...base, recipientType: "manager", to: mgr.email, key: `${prefix}:manager:${low(mgr.email)}` });
  } else {
    specs.push({ ...base, recipientType: "manager", key: `${prefix}:manager:none`, skipReason: mgr.reason });
  }
  return specs;
}

function customerSpec(base: Omit<JobSpec, "key" | "recipientType" | "to" | "skipReason">, email: unknown): JobSpec {
  const prefix = `${base.event}:${base.entityId}:customer`;
  return isEmail(email)
    ? { ...base, recipientType: "customer", to: email.trim(), key: `${prefix}:${low(email)}` }
    : { ...base, recipientType: "customer", key: `${prefix}:none`, skipReason: "customer_email_missing" };
}

async function run(label: string, build: (cfg: MailConfig) => Promise<JobSpec[]>) {
  try {
    const cfg = getMailConfig();
    if (!cfg) {
      // Not configured yet: nothing is lost, the recovery sweep enqueues recent records once SMTP is set up.
      console.warn(`[mail] ${label}: SMTP not configured — notification deferred`);
      return;
    }
    await connectDB();
    const ids = await enqueueJobs(await build(cfg));
    if (ids.length) scheduleProcessing(ids);
  } catch (err) {
    console.error(`[mail] ${label}: could not enqueue notification:`, (err as Error)?.name ?? "error");
  }
}

/* ---------------------------------------------------------------- events */

interface LeadLike {
  _id: Id;
  leadNumber: string;
  name: string;
  institution?: string;
  email?: string;
  phone?: string;
  source?: string;
  preferredModel?: string;
  quantity?: number;
  assignedManager?: Id | null;
  assignedManagerName?: string | null;
  assignedAt?: Date | null;
}

/** New lead saved (website enquiry or manually created). Not used for the lead a quotation request creates — that submission sends one quotation alert instead. */
export function notifyLeadCreated(lead: LeadLike, opts: { customerAck?: boolean } = {}) {
  return run("lead_created", async (cfg) => {
    const base = {
      event: "lead_created" as JobEvent,
      entityType: "lead" as const,
      entityId: idStr(lead._id),
      payload: {
        leadNumber: lead.leadNumber,
        name: lead.name,
        institution: lead.institution,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        preferredModel: (await getVariantLabel(lead.preferredModel)) ?? lead.preferredModel,
        quantity: lead.quantity,
        assignedManagerName: lead.assignedManagerName,
        // Lets a later assignment email recognise "this manager already got the creation alert".
        _managerId: lead.assignedManager ? idStr(lead.assignedManager) : null,
        _assignedAtMs: lead.assignedAt ? new Date(lead.assignedAt).getTime() : null,
      },
    };
    const specs = await internalSpecs(base, cfg, lead.assignedManager);
    if (opts.customerAck && cfg.customerLeadEmails) specs.push(customerSpec(base, lead.email));
    return specs;
  });
}

interface QuoteLike {
  _id: Id;
  quoteNumber: string;
  organizationName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  preferredModel: string;
  quantity: number;
  deliveryCityPostal?: string;
  assignedManager?: Id | null;
  assignedManagerName?: string | null;
}

/** Customer-submitted quotation request. One internal alert per recipient even though the submission also creates a lead. */
export function notifyQuotationCreated(quote: QuoteLike, opts: { leadNumber?: string; customerAck?: boolean } = {}) {
  return run("quotation_created", async (cfg) => {
    const base = {
      event: "quotation_created" as JobEvent,
      entityType: "quotation" as const,
      entityId: idStr(quote._id),
      payload: {
        quoteNumber: quote.quoteNumber,
        leadNumber: opts.leadNumber,
        organizationName: quote.organizationName,
        contactPerson: quote.contactPerson,
        email: quote.email,
        phone: quote.phone,
        preferredModel: (await getVariantLabel(quote.preferredModel)) ?? quote.preferredModel,
        quantity: quote.quantity,
        deliveryCityPostal: quote.deliveryCityPostal,
        assignedManagerName: quote.assignedManagerName,
      },
    };
    const specs = await internalSpecs(base, cfg, quote.assignedManager);
    if (opts.customerAck && cfg.customerLeadEmails) specs.push(customerSpec(base, quote.email));
    return specs;
  });
}

/** Lead handed to a different manager. Only the new assignee is emailed; call only when the assignee actually changed. */
export function notifyLeadAssigned(lead: LeadLike, assignedBy?: string) {
  return run("lead_assigned", async (cfg) => {
    if (!lead.assignedManager) return [];
    const assignedAtMs = lead.assignedAt ? new Date(lead.assignedAt).getTime() : Date.now();
    const managerId = idStr(lead.assignedManager);
    const leadId = idStr(lead._id);

    // The creation alert already told this manager about this very assignment → don't send a second one.
    const dup = await NotificationJob.exists({
      event: "lead_created",
      entityId: leadId,
      recipientType: "manager",
      "payload._managerId": managerId,
      "payload._assignedAtMs": assignedAtMs,
    });
    if (dup) return [];

    const mgr = await resolveManager(lead.assignedManager, cfg);
    const base = {
      event: "lead_assigned" as JobEvent,
      entityType: "lead" as const,
      entityId: leadId,
      payload: {
        leadNumber: lead.leadNumber,
        name: lead.name,
        institution: lead.institution,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        preferredModel: (await getVariantLabel(lead.preferredModel)) ?? lead.preferredModel,
        assignedManagerName: lead.assignedManagerName,
        assignedBy,
      },
    };
    const key = `lead_assigned:${leadId}:${managerId}:${assignedAtMs}:manager`;
    return [mgr.email ? { ...base, recipientType: "manager" as RecipientType, to: mgr.email, key } : { ...base, recipientType: "manager" as RecipientType, key, skipReason: mgr.reason }];
  });
}

interface OrderLike {
  _id: Id;
  reference: string;
  contact: { fullName: string; email: string; phone: string };
  items: { title: string; variantLabel?: string; specLine?: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: { city: string; state?: string };
  payment: { method: string; status: string };
}

const paymentLabel = (p: { method: string; status: string }) =>
  p.status === "illustrative" ? `${p.method} — demo order, no payment collected` : `${p.method} — ${p.status}`;

/**
 * Order confirmed. Fired when the order is first saved in its confirmed state; the unique key
 * (order id × recipient) makes repeated calls, callbacks or retries harmless. Orders carry no
 * manager, so the default manager is the responsible one.
 */
export function notifyOrderConfirmed(order: OrderLike) {
  return run("order_confirmed", async (cfg) => {
    const base = {
      event: "order_confirmed" as JobEvent,
      entityType: "order" as const,
      entityId: idStr(order._id),
      payload: {
        reference: order.reference,
        customerName: order.contact.fullName,
        email: order.contact.email,
        phone: order.contact.phone,
        items: order.items.map((i) => ({ title: i.title, variantLabel: i.variantLabel, specLine: i.specLine, quantity: i.quantity, unitPrice: i.unitPrice })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        paymentStatusLabel: paymentLabel(order.payment),
        deliveryCity: [order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(", "),
      },
    };
    const specs = await internalSpecs(base, cfg, null);
    if (cfg.customerOrderEmails) specs.push(customerSpec(base, order.contact.email));
    return specs;
  });
}

/* ---------------------------------------------------------------- recovery */

/**
 * Recovery path for records saved while their jobs were never written (crash between the save
 * and the enqueue, or SMTP not configured yet). Looks at the last `hours` of records; enqueueing
 * is idempotent, so records that already have jobs are untouched.
 */
export async function recoverMissedNotifications(hours = 72, limitPerKind = 100) {
  await connectDB();
  const since = new Date(Date.now() - hours * 3_600_000);
  // Records that already have a job are excluded in the query, so the cap is spent only on genuinely missed ones.
  // Only well-formed ids can go into the $nin (a stray non-ObjectId entityId would otherwise make the query throw).
  const withJob = async (event: JobEvent) =>
    ((await NotificationJob.distinct("entityId", { event, createdAt: { $gte: since } })) as string[]).filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
  let recovered = 0;

  const quoteDone = await withJob("quotation_created");
  for (const q of await QuoteRequest.find({ createdAt: { $gte: since }, createdByStaff: { $ne: true }, _id: { $nin: quoteDone } }).sort({ createdAt: -1 }).limit(limitPerKind).lean()) {
    await notifyQuotationCreated(q as unknown as QuoteLike, { customerAck: true });
    recovered++;
  }
  // Leads created by a quotation request are covered by that quotation's alert.
  const leadDone = await withJob("lead_created");
  for (const l of await Lead.find({ createdAt: { $gte: since }, source: { $ne: "institutional_quote" }, _id: { $nin: leadDone } }).sort({ createdAt: -1 }).limit(limitPerKind).lean()) {
    await notifyLeadCreated(l as unknown as LeadLike, { customerAck: !(l as { createdBy?: unknown }).createdBy });
    recovered++;
  }
  const orderDone = await withJob("order_confirmed");
  for (const o of await Order.find({ createdAt: { $gte: since }, _id: { $nin: orderDone } }).sort({ createdAt: -1 }).limit(limitPerKind).lean()) {
    await notifyOrderConfirmed(o as unknown as OrderLike);
    recovered++;
  }
  return { recovered };
}
