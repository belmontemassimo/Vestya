"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useFilteredNavItems } from "@/hooks/use-filtered-nav-items";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { filteredMainItems, filteredBottomItems, familyName } = useFilteredNavItems();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] bg-slate-50 text-slate-900 p-0 border-slate-200">
        <SheetHeader className="px-6 py-5">
          <SheetTitle className="text-sm font-semibold tracking-tight text-slate-900">
            {familyName ?? "Hestia"}
          </SheetTitle>
        </SheetHeader>

        <Separator className="bg-slate-200" />

        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {filteredMainItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {filteredBottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
      </SheetContent>
    </Sheet>
  );
}
