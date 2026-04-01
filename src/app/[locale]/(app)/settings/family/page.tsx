import { getTranslations } from "next-intl/server";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { FamilySettingsForm } from "@/components/settings/family-settings-form";

export default async function FamilySettingsPage() {
  const session = await requireFamilyAuth();
  const t = await getTranslations("settings");
  const { familyId } = session.user;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: {
      id: true,
      name: true,
      slug: true,
      createdBy: true,
    },
  });

  if (!family) {
    throw new Error("Family not found");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("family")} />

      <div className="mx-auto max-w-2xl">
        <FamilySettingsForm
          family={family}
          currentUserRole={session.user.familyRole}
        />
      </div>
    </div>
  );
}
