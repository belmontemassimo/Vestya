"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const FOOTER_LINKS = [
  { href: "/privacy", labelKey: "privacy" },
  { href: "/terms", labelKey: "terms" },
  { href: "/cookies", labelKey: "cookies" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
] as const;

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500">
          {t("copyright")}
        </p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-slate-500 transition-colors hover:text-slate-900"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
