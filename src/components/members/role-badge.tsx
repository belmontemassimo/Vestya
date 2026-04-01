"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_CLASSES: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700 border-transparent",
  ADMIN: "bg-blue-100 text-blue-700 border-transparent",
  MEMBER: "bg-green-100 text-green-700 border-transparent",
  VIEWER: "bg-slate-100 text-slate-600 border-transparent",
};

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const t = useTranslations("members");

  return (
    <Badge className={cn(ROLE_CLASSES[role] ?? ROLE_CLASSES.VIEWER)}>
      {t(`roles.${role}`)}
    </Badge>
  );
}
