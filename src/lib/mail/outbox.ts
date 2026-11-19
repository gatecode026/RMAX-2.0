import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { NotificationJob, type INotificationJob } from "@/models/NotificationJob";
import { getMailConfig, type MailConfig } from "@/lib/mail/config";
import { renderJobEmail } from "@/lib/mail/templates";
import { createSender, safeMailError } from "@/lib/mail/transport";

/** Backoff before attempt 2, 3, … after a transient failure. After MAX_ATTEMPTS the job is marked failed. */
const BACKOFF_MS = [1, 5, 30, 120, 360].map((m) => m * 60_000);
export const MAX_ATTEMPTS = 6;
const LOCK_MS = 3 * 60_000;

/* ---------------------------------------------------------------- enqueue */

export type JobSpec = Pick<INotificationJob, "key" | "event" | "recipientType" | "entityType" | "entityId" | "payload"> & {
  to?: string;
  /** When set the job is stored as already skipped, so the reason is on record. */
  skipReason?: string;
};

/**
 * Idempotent insert: a job whose key already exists is left exactly as it is (sent stays sent).
 * Returns the ids of jobs that are ready to send.
 */
export async function enqueueJobs(specs: JobSpec[]): Promise<string[]> {
  if (!specs.length) return [];
  await connectDB();
  const readyIds: string[] = [];
  for (const spec of specs) {
    const { skipReason, ...rest } = spec;
    const res = await NotificationJob.updateOne(
      { key: spec.key },
      { $setOnInsert: { ...rest, status: skipReason ? "skipped" : "pending", skipReason, attempts: 0, nextAttemptAt: new Date() } },
      { upsert: true },
    );
    if (res.upsertedId && !skipReason) readyIds.push(String(res.upsertedId));
  }
  return readyIds;
}

/**
 * Sends after the response where the platform allows (Next's `after`); otherwise detached.
 * Never throws: email problems must not affect the customer-facing request.
 */
export function scheduleProcessing(ids?: string[]) {
  const run = () => processDue({ ids }).catch((e) => console.error("[mail] processing failed:", safeMailError(e)));
  try {
    after(run);
  } catch {
    void run();
  }
}

/* ---------------------------------------------------------------- send */

/** For `npm run mail:check`: confirms the server is reachable and the credentials are accepted. */
export async function verifyTransport(cfg: MailConfig) {
  await createSender(cfg).transporter.verify();
}

type Outcome = "transient" | "permanent" | "uncertain";
function classify(err: unknown, dataIssued: boolean): Outcome {
  const e = err as { code?: string; responseCode?: number };
  const rc = e.responseCode;
  // A server reply code settles it: 4xx = try later, 5xx = rejected for good (nodemailer reports
  // a refused recipient as EENVELOPE whatever the code, so the code must be read first).
  if (rc && rc >= 500) return "permanent";
  if (rc && rc >= 400) return "transient";
  // No reply, but the message body was already on its way: it may have been accepted.
  if (dataIssued) return "uncertain";
  if (e.code === "EENVELOPE") return "permanent";
  return "transient"; // timeouts, DNS, connection refused, auth (fixable by correcting credentials)
}

const messageIdFor = (job: INotificationJob, cfg: MailConfig) => {
  const domain = cfg.from.match(/@([^>\s]+)/)?.[1] ?? "rmax.local";
  return `<${createHash("sha1").update(job.key).digest("hex").slice(0, 24)}@${domain}>`;
};

/** Atomically claims one due job; two workers can never get the same one. */
async function claim(ids?: string[]) {
  const now = new Date();
  return NotificationJob.findOneAndUpdate(
    { status: "pending", nextAttemptAt: { $lte: now }, ...(ids ? { _id: { $in: ids } } : {}) },
    { $set: { status: "processing", lockedUntil: new Date(now.getTime() + LOCK_MS), sendStartedAt: null }, $inc: { attempts: 1 } },
    { sort: { nextAttemptAt: 1 }, new: true },
  ).lean();
}

async function deliver(job: INotificationJob & { _id: unknown }, cfg: MailConfig) {
  const mail = renderJobEmail(job, { appUrl: cfg.appUrl, supportEmail: cfg.replyTo ?? cfg.from.match(/<([^>]+)>/)?.[1] ?? cfg.from });
  // Marked just before sending: a worker that dies after this point leaves an outcome we cannot know.
  await NotificationJob.updateOne({ _id: job._id, status: "processing" }, { $set: { sendStartedAt: new Date() } });
  const { transporter, state } = createSender(cfg);
  try {
    const info = await transporter.sendMail({
      from: cfg.from,
      to: job.to,
      replyTo: cfg.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      messageId: messageIdFor(job, cfg),
    });
    await NotificationJob.updateOne(
      { _id: job._id, status: "processing" },
      { $set: { status: "accepted", acceptedAt: new Date(), sentAt: new Date(), messageId: info.messageId, providerResponse: String(info.response ?? "").slice(0, 160), lockedUntil: null }, $unset: { lastError: "" } },
    );
  } catch (err) {
    const kind = classify(err, state.dataIssued);
    const lastError = safeMailError(err);
    console.warn(`[mail] ${job.event}/${job.recipientType} attempt ${job.attempts} failed (${kind}): ${lastError}`);
    if (kind === "uncertain") {
      await NotificationJob.updateOne({ _id: job._id }, { $set: { status: "uncertain", lastError, lockedUntil: null } });
    } else if (kind === "permanent" || job.attempts >= MAX_ATTEMPTS) {
      await NotificationJob.updateOne({ _id: job._id }, { $set: { status: "failed", lastError, lockedUntil: null } });
    } else {
      const wait = BACKOFF_MS[Math.min(job.attempts - 1, BACKOFF_MS.length - 1)];
      await NotificationJob.updateOne({ _id: job._id }, { $set: { status: "pending", lastError, lockedUntil: null, nextAttemptAt: new Date(Date.now() + wait) } });
    }
  }
}

/**
 * Sends due jobs. `ids` restricts to freshly enqueued ones (plus a few other due retries, so
 * ordinary traffic also drives retries). Waits for SMTP configuration instead of burning attempts.
 */
export async function processDue(opts: { ids?: string[]; limit?: number } = {}): Promise<{ sent: number }> {
  const cfg = getMailConfig();
  if (!cfg) return { sent: 0 };
  await connectDB();
  let sent = 0;
  const limit = opts.limit ?? 25;
  const runOne = async (ids?: string[]) => {
    const job = await claim(ids);
    if (!job) return false;
    await deliver(job as INotificationJob & { _id: unknown }, cfg);
    sent++;
    return true;
  };
  if (opts.ids?.length) for (let i = 0; i < opts.ids.length; i++) if (!(await runOne(opts.ids))) break;
  for (let i = 0; i < (opts.ids ? 5 : limit); i++) if (!(await runOne())) break;
  return { sent };
}

/**
 * Housekeeping for the cron endpoint: workers that died before / during a send are released
 * (never started → pending; mid-send → uncertain, not auto-resent).
 */
export async function releaseStaleJobs() {
  await connectDB();
  const now = new Date();
  const stale = { status: "processing" as const, lockedUntil: { $lt: now } };
  const midSend = await NotificationJob.updateMany(
    { ...stale, sendStartedAt: { $ne: null } },
    { $set: { status: "uncertain", lastError: "worker stopped during send", lockedUntil: null } },
  );
  const neverStarted = await NotificationJob.updateMany({ ...stale, sendStartedAt: null }, { $set: { status: "pending", lockedUntil: null } });
  return { uncertain: midSend.modifiedCount, requeued: neverStarted.modifiedCount };
}
