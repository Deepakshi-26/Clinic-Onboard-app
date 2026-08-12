import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, code: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const code = String(credentials?.code ?? "");
        if (!email || !password || !code) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { employee: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Inactive employees keep their record and data for history, but
        // lose portal access.
        if (user.employee?.status === "INACTIVE") return null;

        // Second factor: an unexpired, unconsumed code emailed to this
        // address by requestLoginOtp(). Consumed atomically via the
        // where-clause guard so a code can never be replayed even under a
        // race between two concurrent sign-in attempts.
        const otp = await prisma.loginOtp.findFirst({
          where: { email, consumed: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp) return null;

        const codeValid = await bcrypt.compare(code, otp.codeHash);
        if (!codeValid) return null;

        const consume = await prisma.loginOtp.updateMany({
          where: { id: otp.id, consumed: false },
          data: { consumed: true },
        });
        if (consume.count !== 1) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "HR" | "EMPLOYEE" }).role;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as "HR" | "EMPLOYEE";
        session.user.name = token.name ?? null;
      }
      return session;
    },
  },
});
