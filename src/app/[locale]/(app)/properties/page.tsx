import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PropertiesPageClient } from "@/components/properties/properties-page-client";

export default async function PropertiesPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const [properties, subscription] = await Promise.all([
    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      include: {
        _count: {
          select: {
            tasks: { where: { deletedAt: null } },
            documents: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({
      where: { familyId },
      select: { plan: true },
    }),
  ]);

  return (
    <PropertiesPageClient
      properties={properties}
      currentPlan={subscription?.plan ?? "free"}
    />
  );
}
