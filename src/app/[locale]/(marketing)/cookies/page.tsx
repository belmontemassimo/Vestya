import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function CookiesPage() {
  const t = await getTranslations("legal");

  return (
    <div className="py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToHome")}
      </Link>

      <article className="prose prose-slate max-w-none">
        <h1>{t("cookies.title")}</h1>

        <p>{t("cookies.intro")}</p>

        <h2>{t("cookies.whatWeUseTitle")}</h2>

        <h3>{t("cookies.essentialTitle")}</h3>
        <p>{t("cookies.essentialText")}</p>

        <h3>{t("cookies.functionalTitle")}</h3>
        <p>{t("cookies.functionalText")}</p>

        <h3>{t("cookies.analyticsTitle")}</h3>
        <p>{t("cookies.analyticsText")}</p>

        <h2>{t("cookies.thirdPartyTitle")}</h2>
        <p>{t("cookies.thirdPartyText")}</p>

        <h2>{t("cookies.managingTitle")}</h2>
        <p>{t("cookies.managingText")}</p>

        <h2>{t("cookies.contactTitle")}</h2>
        <p>{t("cookies.contactText")}</p>
      </article>
    </div>
  );
}
