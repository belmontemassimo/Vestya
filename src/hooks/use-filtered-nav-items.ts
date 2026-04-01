"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { mainNavItems, bottomNavItems } from "@/config/navigation";
import type { FamilyRole } from "@prisma/client";

export function useFilteredNavItems() {
  const { data: session } = useSession();
  const role = session?.user?.familyRole as FamilyRole | null;
  const familyName = session?.user?.familyName as string | undefined;

  const filteredMainItems = useMemo(
    () =>
      mainNavItems.filter((item) => {
        if (!item.permission) return true;
        if (!role) return false;
        return hasPermission(
          role,
          item.permission as Parameters<typeof hasPermission>[1],
        );
      }),
    [role],
  );

  const filteredBottomItems = useMemo(
    () =>
      bottomNavItems.filter((item) => {
        if (!item.permission) return true;
        if (!role) return false;
        return hasPermission(
          role,
          item.permission as Parameters<typeof hasPermission>[1],
        );
      }),
    [role],
  );

  return { filteredMainItems, filteredBottomItems, familyName };
}
