import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PricingClient } from "./pricing-client";

export default async function PricingPage() {
  const session = await requireFamilyAuth();

  const subscription = await prisma.subscription.findUnique({
    where: { familyId: session.user.familyId },
    select: { plan: true, status: true },
  });

  return (
    <PricingClient currentPlan={subscription?.plan ?? "free"} />
  );
}
