"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string | null;
  city: string | null;
  country: string | null;
}

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  HOUSE: "default",
  APARTMENT: "secondary",
  LAND: "outline",
  COMMERCIAL: "secondary",
  OTHER: "outline",
};

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  FOR_SALE: "warning",
  FOR_RENT: "warning",
};

export function PropertyCard({
  id,
  name,
  type,
  status,
  address,
  city,
  country,
}: PropertyCardProps) {
  const t = useTranslations("properties");

  const location = [city, country].filter(Boolean).join(", ");

  return (
    <Link href={`/properties/${id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base truncate">{name}</CardTitle>
          <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
            {t(`status.${status}`)}
          </Badge>
        </CardHeader>
        <CardContent>
          <Badge variant={TYPE_VARIANTS[type] ?? "outline"} className="mb-3">
            {t(`type.${type}`)}
          </Badge>
          {(address || location) && (
            <div className="flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                {address && <p>{address}</p>}
                {location && <p>{location}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
