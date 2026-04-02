import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function TermsPage() {
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
        <h1>{t("terms.title")}</h1>
        <p className="lead">{t("terms.lastUpdated")}</p>

        <h2>{t("terms.acceptanceTitle")}</h2>
        <p>{t("terms.acceptanceText")}</p>

        <h2>{t("terms.accountTitle")}</h2>
        <p>{t("terms.accountText")}</p>

        <h2>{t("terms.subscriptionTitle")}</h2>
        <p>{t("terms.subscriptionText")}</p>
        <ul>
          <li>{t("terms.subscriptionRenewal")}</li>
          <li>{t("terms.subscriptionCancellation")}</li>
          <li>{t("terms.subscriptionRefund")}</li>
        </ul>

        <h2>{t("terms.acceptableUseTitle")}</h2>
        <p>{t("terms.acceptableUseIntro")}</p>
        <ul>
          <li>{t("terms.acceptableUseNoHarm")}</li>
          <li>{t("terms.acceptableUseNoUnauthorized")}</li>
          <li>{t("terms.acceptableUseNoIllegal")}</li>
          <li>{t("terms.acceptableUseNoAbuse")}</li>
        </ul>

        <h2>{t("terms.ipTitle")}</h2>
        <p>{t("terms.ipText")}</p>

        <h2>{t("terms.liabilityTitle")}</h2>
        <p>{t("terms.liabilityText")}</p>

        <h2>{t("terms.terminationTitle")}</h2>
        <p>{t("terms.terminationText")}</p>

        <h2>{t("terms.governingLawTitle")}</h2>
        <p>{t("terms.governingLawText")}</p>

        <h2>{t("terms.contactTitle")}</h2>
        <p>{t("terms.contactText")}</p>
      </article>
    </div>
  );
}
