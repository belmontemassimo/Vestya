"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Topbar() {
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const familyName = session?.user?.familyName;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Mobile family name */}
          <div className="flex-1 lg:hidden text-center">
            {familyName && (
              <span className="text-sm font-semibold text-slate-900 truncate">
                {familyName}
              </span>
            )}
          </div>

          {/* Spacer */}
          <div className="hidden lg:flex lg:flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LocaleSwitcher />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
