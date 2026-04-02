import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function AboutPage() {
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
        <h1>{t("about.title")}</h1>

        <p>{t("about.description")}</p>

        <h2>{t("about.missionTitle")}</h2>
        <p>{t("about.missionText")}</p>

        <h2>{t("about.storyTitle")}</h2>
        <p>{t("about.storyText")}</p>

        <h2>{t("about.contactTitle")}</h2>
        <p>{t("about.contactText")}</p>
      </article>
    </div>
  );
}
