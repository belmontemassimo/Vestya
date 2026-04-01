"use client";

import { MapPin as MapPinIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "@/components/widgets/contents/map-pin";

interface PropertyWidgetProps {
  property: {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
    propertyType: string;
    status: string;
    latitude?: number | null;
    longitude?: number | null;
    images?: unknown;
  };
  displayMode?: "map" | "image";
  coverImage?: string;
}

export function PropertyWidget({
  property,
  displayMode = "map",
  coverImage,
}: PropertyWidgetProps) {
  const tProps = useTranslations("properties");

  const location = [property.city, property.country]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates =
    property.latitude != null && property.longitude != null;

  const resolvedCoverImage =
    coverImage ?? getFirstImage(property.images);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          {property.name}
        </h3>
        {location && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPinIcon className="h-3 w-3" />
            {location}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {tProps(`type.${property.propertyType}`)}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {tProps(`status.${property.status}`)}
        </Badge>
      </div>

      <div className="h-32 overflow-hidden rounded-lg">
        {displayMode === "image" && resolvedCoverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element -- user-uploaded cover */
          <img
            src={resolvedCoverImage}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : hasCoordinates ? (
          <MapPin
            latitude={property.latitude!}
            longitude={property.longitude!}
            name={property.name}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-400">
            No coordinates available
          </div>
        )}
      </div>
    </div>
  );
}

function getFirstImage(images: unknown): string | null {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string") {
    return images[0];
  }
  return null;
}
