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
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Throttle brute-force attempts per account.
        if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000).allowed) return null;

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash").lean();
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: String(user._id), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
