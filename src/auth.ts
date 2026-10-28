import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { getClientPromise } from "@/lib/mongo-client";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/schemas";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Auth.js v5. The Credentials provider requires the JWT session strategy, so the
 * MongoDB adapter is used for the shared `users` collection while sessions live in a signed cookie.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getClientPromise()),
  // Trust the incoming Host header (required when self-hosting behind a proxy; Vercel does this automatically).
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, preVerified: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const preVerified = (raw as Record<string, unknown>)?.preVerified === "true";

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash role status name").lean();
        if (!user) return null;
        if (user.status === "inactive") return null;

        // If pre-verified by loginAction server action, skip duplicate bcrypt.compare (~750ms saved)
        if (!preVerified) {
          if (!password || !user.passwordHash) return null;
          if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000).allowed) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
        }

        // Update last login timestamp asynchronously
        User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } }).exec().catch(() => {});

        const role = user.role || "customer";
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role,
          status: user.status || "active",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.uid) session.user.id = token.uid as string;
        if (token.role) session.user.role = token.role;
        if (token.status) session.user.status = token.status;
      }
      return session;
    },
  },
});
