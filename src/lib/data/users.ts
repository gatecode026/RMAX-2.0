import "server-only";
import { connectDB } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import { getSessionUserId } from "@/lib/session";

export type UserDTO = Omit<IUser, "passwordHash"> & { _id: string };

/** Profile of the signed-in user (never includes the password hash), or null for guests. */
export async function getCurrentUserProfile(): Promise<UserDTO | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  await connectDB();
  const doc = await User.findById(id).lean();
  if (!doc) return null;
  const { passwordHash: _omit, ...rest } = JSON.parse(JSON.stringify(doc)) as UserDTO & { passwordHash?: string };
  void _omit;
  return rest;
}
