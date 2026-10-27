import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/lib/enums";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    status?: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status?: UserStatus;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
    status?: UserStatus;
  }
}

