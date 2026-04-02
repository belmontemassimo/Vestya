"use client";

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
  const hasCoordinates =
    property.latitude != null && property.longitude != null;

  const rawImage = coverImage ?? getFirstImage(property.images);
  const resolvedCoverImage = rawImage ? toImageSrc(rawImage) : null;

  const showImage = displayMode === "image" && resolvedCoverImage;

  return (
    <div className="relative h-full w-full">
      {/* Background: image, map, or fallback */}
      <div className="absolute inset-0">
        {showImage ? (
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
            No location
          </div>
        )}
      </div>

      {/* Name overlay — uses a scrim for contrast */}
      {(showImage || hasCoordinates) && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-4 pb-8 pt-3">
          <h3 className="text-sm font-bold text-white drop-shadow-sm">
            {property.name}
          </h3>
        </div>
      )}

      {/* Fallback name (no image/map — dark text on light bg) */}
      {!showImage && !hasCoordinates && (
        <div className="absolute left-4 top-3">
          <h3 className="text-sm font-bold text-slate-800">
            {property.name}
          </h3>
        </div>
      )}
    </div>
  );
}

function getFirstImage(images: unknown): string | null {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string") {
    return images[0];
  }
  return null;
}

function toImageSrc(keyOrUrl: string): string {
  if (keyOrUrl.startsWith("http")) return keyOrUrl;
  return `/api/storage/image?key=${encodeURIComponent(keyOrUrl)}`;
}
