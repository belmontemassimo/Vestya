"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyCardProps {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string | null;
  city: string | null;
  country: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const t = useTranslations("properties");

  const location = [city, country].filter(Boolean).join(", ");

  return (
    <Card className="relative transition-shadow hover:shadow-md h-full">
      <Link href={`/properties/${id}`} className="absolute inset-0 z-0" />

      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base truncate">{name}</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
            {t(`status.${status}`)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("editProperty")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteProperty")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
  );
}
