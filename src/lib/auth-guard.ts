import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { FamilyRole } from "@prisma/client";

export interface AuthenticatedSession extends Session {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    familyId: string;
    familyRole: FamilyRole;
    familyName: string;
  };
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/en/login");
  }
  return session;
}

export async function requireFamilyAuth(): Promise<AuthenticatedSession> {
  const session = await requireAuth();
  if (!session.user.familyId || !session.user.familyRole) {
    redirect("/en/onboarding");
  }
  return session as AuthenticatedSession;
}
