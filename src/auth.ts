import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { hasDatabase, hasGoogleAuth } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "preproom-local-development-secret-change-before-deploy"
      : undefined),
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  providers: hasGoogleAuth ? [Google] : [],
  session: {
    strategy: hasDatabase ? "database" : "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
      }
      return session;
    },
  },
});
