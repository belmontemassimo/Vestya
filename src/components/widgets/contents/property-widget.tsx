"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreVertical, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getPropertyCoverUploadUrl,
  setPropertyCoverImage,
} from "@/actions/property.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  isEditing?: boolean;
  onChangeImage?: (storageKey: string) => void;
}

export function PropertyWidget({
  property,
  displayMode = "map",
  coverImage,
  isEditing = false,
  onChangeImage,
}: PropertyWidgetProps) {
  const t = useTranslations("widgets");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasCoordinates =
    property.latitude != null && property.longitude != null;

  const rawImage = coverImage ?? getFirstImage(property.images);
  const resolvedCoverImage = rawImage ? toImageSrc(rawImage) : null;

  const showImage = displayMode === "image" && resolvedCoverImage;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const urlResult = await getPropertyCoverUploadUrl(property.id, file.type);
      if (!urlResult.success) {
        toast.error(urlResult.error ?? "Failed to get upload URL");
        return;
      }

      const { uploadUrl, storageKey } = urlResult.data;

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      await setPropertyCoverImage(property.id, storageKey);
      onChangeImage?.(storageKey);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Background: image, map, or fallback */}
      <div className="absolute inset-0">
        {isUploading ? (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : showImage ? (
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
      {(showImage || hasCoordinates) && !isUploading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-4 pb-8 pt-3">
          <h3 className="text-sm font-bold text-white drop-shadow-sm">
            {property.name}
          </h3>
        </div>
      )}

      {/* Fallback name (no image/map — dark text on light bg) */}
      {!showImage && !hasCoordinates && !isUploading && (
        <div className="absolute left-4 top-3">
          <h3 className="text-sm font-bold text-slate-800">
            {property.name}
          </h3>
        </div>
      )}

      {/* Edit menu — bottom right, only in edit mode */}
      {isEditing && onChangeImage && (
        <div className="absolute bottom-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="rounded-md bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {t("changeImage")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
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
