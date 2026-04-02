import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function PrivacyPage() {
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
        <h1>{t("privacy.title")}</h1>
        <p className="lead">{t("privacy.lastUpdated")}</p>

        <p>{t("privacy.intro")}</p>

        <h2>{t("privacy.dataCollectedTitle")}</h2>
        <p>{t("privacy.dataCollectedIntro")}</p>
        <ul>
          <li>{t("privacy.dataCollectedName")}</li>
          <li>{t("privacy.dataCollectedEmail")}</li>
          <li>{t("privacy.dataCollectedProperty")}</li>
          <li>{t("privacy.dataCollectedDocuments")}</li>
          <li>{t("privacy.dataCollectedFinancial")}</li>
        </ul>

        <h2>{t("privacy.howWeUseTitle")}</h2>
        <p>{t("privacy.howWeUseIntro")}</p>
        <ul>
          <li>{t("privacy.howWeUseService")}</li>
          <li>{t("privacy.howWeUseEmails")}</li>
          <li>{t("privacy.howWeUseSecurity")}</li>
        </ul>

        <h2>{t("privacy.dataStorageTitle")}</h2>
        <p>{t("privacy.dataStorageText")}</p>

        <h2>{t("privacy.thirdPartiesTitle")}</h2>
        <p>{t("privacy.thirdPartiesIntro")}</p>
        <ul>
          <li>{t("privacy.thirdPartyStripe")}</li>
          <li>{t("privacy.thirdPartyResend")}</li>
          <li>{t("privacy.thirdPartyVercel")}</li>
          <li>{t("privacy.thirdPartyNominatim")}</li>
        </ul>

        <h2>{t("privacy.retentionTitle")}</h2>
        <p>{t("privacy.retentionText")}</p>

        <h2>{t("privacy.yourRightsTitle")}</h2>
        <p>{t("privacy.yourRightsIntro")}</p>
        <ul>
          <li>{t("privacy.rightAccess")}</li>
          <li>{t("privacy.rightRectification")}</li>
          <li>{t("privacy.rightErasure")}</li>
          <li>{t("privacy.rightPortability")}</li>
          <li>{t("privacy.rightObjection")}</li>
        </ul>

        <h2>{t("privacy.contactTitle")}</h2>
        <p>{t("privacy.contactText")}</p>
      </article>
    </div>
  );
}
