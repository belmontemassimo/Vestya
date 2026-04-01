import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/register-form";
import { Link } from "@/i18n/navigation";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("registerSubtitle")}
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
