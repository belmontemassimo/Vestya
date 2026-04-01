"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  string,
  "secondary" | "default" | "warning" | "success" | "destructive" | "outline"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  FOR_SALE: "warning",
  FOR_RENT: "warning",
  UNDER_RENOVATION: "destructive",
  ARCHIVED: "outline",
};

interface PropertyStatusBadgeProps {
  status: string;
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const t = useTranslations("properties");

  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
      {t(`status.${status}`)}
    </Badge>
  );
}
