import "server-only";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import type { UserRole } from "@/lib/enums";
import { rateLimit } from "@/lib/rate-limit";

export type ResolvedAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
};

export type LoginResult = { ok: true; account: ResolvedAccount } | { ok: false; message: string };

const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_MS = 15 * 60 * 1000;
const STAFF_ROLES: UserRole[] = ["super_admin", "admin", "manager"];

type Candidate = IUser & { _id: unknown };

async function loadCandidates(email: string, roles: UserRole[]): Promise<Candidate[]> {
  await connectDB();
  return User.find({ email, role: { $in: roles } })
    .select("+passwordHash name email role status tokenVersion failedLoginAttempts lockedUntil")
    .lean<Candidate[]>();
}

async function registerFailure(id: unknown): Promise<void> {
  const doc = await User.findById(id).select("failedLoginAttempts");
  if (!doc) return;
  const attempts = (doc.failedLoginAttempts || 0) + 1;
  const update: Record<string, unknown> = { failedLoginAttempts: attempts };
  if (attempts >= LOCKOUT_THRESHOLD) update.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
  await User.updateOne({ _id: id }, { $set: update });
}

async function registerSuccess(id: unknown): Promise<void> {
  await User.updateOne(
    { _id: id },
    { $set: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } },
  );
}

function isLocked(c: Candidate): boolean {
  return Boolean(c.lockedUntil && new Date(c.lockedUntil).getTime() > Date.now());
}

/**
 * Resolves email + password against every account the email owns within the given role
 * namespace, and returns the single account whose password matched.
 *
 * - 0 matches  -> generic "invalid credentials" (never reveals which roles exist for the email)
 * - 1 match    -> success
 * - >1 matches -> rejected as ambiguous (should not happen with independently-set passwords;
 *                 guards against the rare case where two accounts for the same email were
 *                 accidentally given the same password)
 */
async function resolveLogin(
  email: string,
  password: string,
  roles: UserRole[],
  genericInvalidMessage: string,
): Promise<LoginResult> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!rateLimit(`login:${normalizedEmail}`, 10, 15 * 60 * 1000).allowed) {
    return { ok: false, message: "Too many login attempts. Please try again in 15 minutes." };
  }

  const candidates = await loadCandidates(normalizedEmail, roles);
  if (candidates.length === 0) {
    return { ok: false, message: genericInvalidMessage };
  }

  // Evaluate every candidate (don't short-circuit) so response timing doesn't reveal how many
  // role-accounts exist for this email.
  const matches: Candidate[] = [];
  for (const c of candidates) {
    if (isLocked(c)) continue;
    if (!c.passwordHash) continue;
    const valid = await bcrypt.compare(password, c.passwordHash);
    if (valid) matches.push(c);
  }

  if (matches.length === 0) {
    // Register the failed attempt against every unlocked candidate so lockout tracks per-account.
    await Promise.all(candidates.filter((c) => !isLocked(c)).map((c) => registerFailure(c._id)));
    const anyActiveMatch = candidates.some((c) => c.status !== "inactive");
    if (!anyActiveMatch && candidates.length > 0) {
      return { ok: false, message: "Your account is currently inactive. Please contact support." };
    }
    return { ok: false, message: genericInvalidMessage };
  }

  if (matches.length > 1) {
    // Pathological: the same password authenticates more than one role-account for this email.
    // Refuse rather than guessing which role the caller intended.
    return {
      ok: false,
      message: "This password matches more than one account. Please use a distinct password per account or contact support.",
    };
  }

  const account = matches[0];
  if (account.status === "inactive") {
    return { ok: false, message: "Your account is currently inactive. Please contact support." };
  }

  await registerSuccess(account._id);

  return {
    ok: true,
    account: {
      id: String(account._id),
      name: account.name,
      email: account.email,
      role: account.role,
      tokenVersion: account.tokenVersion ?? 0,
    },
  };
}

/** Customer portal login — only ever matches the customer-role identity for this email. */
export async function resolveCustomerLogin(email: string, password: string): Promise<LoginResult> {
  return resolveLogin(email, password, ["customer"], "User not found or invalid credentials.");
}

/**
 * Admin/Manager staff portal login — matches whichever of the email's staff-role identities
 * (Admin, Super Admin, Manager) the submitted password belongs to. The password alone
 * determines which dashboard is opened; the caller never selects a role.
 */
export async function resolveStaffLogin(email: string, password: string): Promise<LoginResult> {
  return resolveLogin(
    email,
    password,
    STAFF_ROLES,
    "Access denied. Only authorized managers and administrative staff can sign in here.",
  );
}
