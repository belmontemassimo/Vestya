import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.familyId) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("onboarding");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <OnboardingForm />
    </div>
  );
}
