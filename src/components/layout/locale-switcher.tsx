"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(newLocale: string) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
      {LOCALES.map((loc) => (
        <Button
          key={loc.code}
          variant="ghost"
          size="sm"
          onClick={() => handleSwitch(loc.code)}
          className={cn(
            "h-7 px-2 text-xs font-medium rounded-md",
            locale === loc.code
              ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          {loc.label}
        </Button>
      ))}
    </div>
  );
}
