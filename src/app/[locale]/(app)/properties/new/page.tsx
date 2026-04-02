import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { NewPropertyClient } from "./new-property-client";

export default async function NewPropertyPage() {
  const session = await requireFamilyAuth();
  const subscription = await prisma.subscription.findUnique({
    where: { familyId: session.user.familyId },
    select: { plan: true },
  });
  return <NewPropertyClient currentPlan={subscription?.plan ?? "free"} />;
}
