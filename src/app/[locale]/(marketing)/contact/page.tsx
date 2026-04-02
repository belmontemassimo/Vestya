import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Mail, MapPin } from "lucide-react";

export default async function ContactPage() {
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
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.intro")}</p>
      </article>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-3">
            <Mail className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t("contact.emailTitle")}
          </h3>
          <a
            href="mailto:support@vestya.net"
            className="mt-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            support@vestya.net
          </a>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-3">
            <MapPin className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t("contact.addressTitle")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            11 Victoria Road<br />
            Exeter, EX4 6JB<br />
            United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}
