"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  hideBack?: boolean;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  subtitle,
  hideBack,
  children,
}: PageHeaderProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const subtext = subtitle ?? description;

  const isDashboard = pathname === "/dashboard";
  const showBack = !hideBack && !isDashboard;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => router.back()}
            title={t("back")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtext && (
            <p className="mt-1 text-sm text-slate-500">{subtext}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="mt-3 flex items-center gap-2 sm:mt-0">{children}</div>
      )}
    </div>
  );
}
