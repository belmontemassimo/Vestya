import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { FamilyRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      familyId: string | null;
      familyRole: FamilyRole | null;
      familyName: string | null;
    };
  }

  interface User {
    id: string;
    familyId?: string | null;
    familyRole?: FamilyRole | null;
    familyName?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    familyId: string | null;
    familyRole: FamilyRole | null;
    familyName: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Always refresh family membership from DB to self-heal stale tokens
      const membership = await prisma.familyMembership.findFirst({
        where: {
          userId: token.id as string,
          status: "ACTIVE",
        },
        include: {
          family: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      });

      const family = (membership as { family?: { id: string; name: string } } | null)?.family;
      token.familyId = family?.id ?? null;
      token.familyRole = (membership?.role as FamilyRole) ?? null;
      token.familyName = family?.name ?? null;

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.familyId = token.familyId as string | null;
      session.user.familyRole = token.familyRole as FamilyRole | null;
      session.user.familyName = token.familyName as string | null;
      return session;
    },
  },
});
