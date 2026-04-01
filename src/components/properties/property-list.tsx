"use client";

import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Property {
  id: string;
  name: string;
  type?: string;
  propertyType?: string;
  status: string;
  address?: string | null;
  addressLine1?: string | null;
  city: string | null;
  country: string | null;
}

interface PropertyListProps {
  properties: readonly Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
  const t = useTranslations("properties");

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button asChild>
            <Link href="/properties/new">{t("addProperty")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          name={property.name}
          type={property.type ?? property.propertyType ?? "OTHER"}
          status={property.status}
          address={property.address ?? property.addressLine1 ?? null}
          city={property.city}
          country={property.country}
        />
      ))}
    </div>
  );
}
