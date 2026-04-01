"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useFilteredNavItems } from "@/hooks/use-filtered-nav-items";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { filteredMainItems, filteredBottomItems, familyName } = useFilteredNavItems();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[260px] lg:flex-col border-r border-slate-200 bg-slate-50 text-slate-900">
      {/* Family name header */}
      <div className="flex items-center px-6 h-16 shrink-0">
        {familyName ? (
          <span className="text-sm font-semibold tracking-tight truncate">
            {familyName}
          </span>
        ) : (
          <span className="text-sm font-semibold tracking-tight">Hestia</span>
        )}
      </div>

      <Separator className="bg-slate-200" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredMainItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.titleKey.replace("nav.", ""))}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-200" />

      {/* Bottom nav */}
      <nav className="px-3 py-4 space-y-0.5 shrink-0">
        {filteredBottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.titleKey.replace("nav.", ""))}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
