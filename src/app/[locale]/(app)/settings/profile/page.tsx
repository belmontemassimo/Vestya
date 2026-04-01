import { getTranslations } from "next-intl/server";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProfileSettingsPage() {
  const session = await requireFamilyAuth();
  const t = await getTranslations("settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile")} />

      <div className="mx-auto max-w-2xl">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
