import { Schema, model, models, type Model } from "mongoose";

export const JOB_STATUSES = ["pending", "processing", "accepted", "sent", "failed", "skipped", "uncertain"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobEvent = "lead_created" | "quotation_created" | "lead_assigned" | "order_confirmed";
export type RecipientType = "admin" | "manager" | "customer";

/**
 * Email outbox: one row per business event × recipient. The unique `key` makes enqueueing
 * idempotent (repeat requests, retries and the recovery sweep can never create a second job),
 * and `status` + `lockedUntil` stop two workers from sending the same job.
 *
 *  pending     waiting for (re)delivery at nextAttemptAt
 *  processing  claimed by a worker until lockedUntil
 *  accepted    the SMTP provider took the message ("250 … queued"). That is provider acceptance only: it says
 *              nothing about inbox delivery. It is final for retry purposes: never re-sent just because
 *              delivery is unknown.
 *  sent        LEGACY value written before "accepted" existed. Same meaning as accepted (no delivery evidence);
 *              use `isAccepted()` instead of comparing to either string.
 *  failed      gave up (permanent error, or retries exhausted)
 *  skipped     nothing to send; skipReason says why (e.g. manager has no email)
 *  uncertain   connection dropped while the message body was in flight — it may have been
 *              delivered, so it is NOT auto-resent (check the SMTP provider log, then set it back to pending)
 */
export interface INotificationJob {
  key: string;
  event: JobEvent;
  recipientType: RecipientType;
  to?: string;
  entityType: "lead" | "quotation" | "order";
  entityId: string;
  /** Snapshot of what the template needs (customer-safe fields only for customer emails). */
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  nextAttemptAt: Date;
  lockedUntil?: Date | null;
  /** Set right before the SMTP send starts, so a worker that died mid-send can be told apart from one that never started. */
  sendStartedAt?: Date | null;
  lastError?: string;
  skipReason?: string;
  messageId?: string;
  /** When the provider accepted the message. `sentAt` is kept equal to it for older readers. */
  acceptedAt?: Date;
  /** Provider's reply, e.g. "250 2.0.0 OK: queued as <id>" (no addresses, no content). */
  providerResponse?: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<INotificationJob>(
  {
    key: { type: String, required: true, unique: true },
    event: { type: String, required: true, index: true },
    recipientType: { type: String, required: true },
    to: { type: String, trim: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: JOB_STATUSES, default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    sendStartedAt: { type: Date, default: null },
    lastError: { type: String },
    skipReason: { type: String },
    messageId: { type: String },
    acceptedAt: { type: Date },
    providerResponse: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true },
);
schema.index({ status: 1, nextAttemptAt: 1 });

export const NotificationJob: Model<INotificationJob> = models.NotificationJob || model<INotificationJob>("NotificationJob", schema);

/** True once the provider has taken the message. Historical `sent` records (no delivery evidence) count as accepted. */
export const isAccepted = (status: string) => status === "accepted" || status === "sent";
