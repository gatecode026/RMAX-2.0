import "server-only";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkApiRole, requireRole, type SessionUser } from "@/lib/session";
import { notificationEmitter } from "@/lib/notifications";
import {
  PERMISSION_KEYS,
  firstAllowedHref,
  normalizePermissions,
  type ManagerPermissions,
  type PermissionKey,
} from "@/lib/permissions";

const ALL_ALLOWED = Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true])) as ManagerPermissions;

const isAdminRole = (role: string) => role === "super_admin" || role === "admin";

/** Saved permissions for a manager, normalised (legacy defaults when nothing is saved). Read fresh on every call so changes apply to the very next request. */
export async function getManagerPermissions(userId: string): Promise<ManagerPermissions> {
  await connectDB();
  const doc = await User.findById(userId).select("+permissions").lean();
  return normalizePermissions(doc?.permissions);
}

/** Permissions for any staff session: admins hold everything, managers get their saved set. */
export async function getStaffPermissions(user: SessionUser): Promise<ManagerPermissions> {
  return isAdminRole(user.role) ? ALL_ALLOWED : getManagerPermissions(user.id);
}

/**
 * API guard. Admins always pass; a manager needs at least one of `anyOf`. Returns the same
 * `{ error, status }` shape as `checkApiRole` so routes can reuse their existing error handling.
 */
export async function checkApiPermission(
  anyOf: PermissionKey | PermissionKey[],
): Promise<{ user: SessionUser; isAdmin: boolean; permissions: ManagerPermissions } | { error: string; status: number }> {
  const auth = await checkApiRole(["super_admin", "admin", "manager"]);
  if ("error" in auth) return auth;
  const isAdmin = isAdminRole(auth.user.role);
  const permissions = isAdmin ? ALL_ALLOWED : await getManagerPermissions(auth.user.id);
  const keys = Array.isArray(anyOf) ? anyOf : [anyOf];
  if (!keys.some((k) => permissions[k])) {
    return { error: "Forbidden: you do not have permission for this action", status: 403 };
  }
  return { user: auth.user, isAdmin, permissions };
}

/** Server-component guard for a manager page: sends the manager to their first allowed page when the permission is off. */
export async function requireManagerPermission(key: PermissionKey): Promise<{ user: SessionUser; permissions: ManagerPermissions }> {
  const user = await requireRole(["manager"]);
  const permissions = await getManagerPermissions(user.id);
  if (!permissions[key]) redirect(firstAllowedHref(permissions));
  return { user, permissions };
}

/** Tells a signed-in manager's open tabs (via the notifications SSE stream) to re-read their permissions. */
export function publishPermissionChange(managerId: string, permissions: ManagerPermissions) {
  notificationEmitter.emit("permissions", { managerId, permissions });
}
