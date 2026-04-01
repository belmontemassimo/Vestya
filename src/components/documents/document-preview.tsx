"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  name: string;
  mimeType: string;
}

function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/")
  );
}

export function DocumentPreview({
  open,
  onOpenChange,
  url,
  name,
  mimeType,
}: DocumentPreviewProps) {
  const t = useTranslations("documents");
  const previewable = isPreviewable(mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle className="truncate text-base">{name}</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, "_blank")}
            className="shrink-0"
          >
            <Download className="mr-2 h-4 w-4" />
            {t("download")}
          </Button>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-slate-200 bg-slate-50">
          {!previewable ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              {t("noPreview")}
            </div>
          ) : mimeType.startsWith("image/") ? (
            /* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs */
            <img
              src={url}
              alt={name}
              className="mx-auto max-h-[70vh] object-contain"
            />
          ) : mimeType === "application/pdf" ? (
            <iframe
              src={url}
              title={name}
              className="h-[70vh] w-full"
            />
          ) : mimeType.startsWith("video/") ? (
            <video controls className="mx-auto max-h-[70vh]">
              <source src={url} type={mimeType} />
            </video>
          ) : mimeType.startsWith("audio/") ? (
            <div className="flex h-32 items-center justify-center">
              <audio controls>
                <source src={url} type={mimeType} />
              </audio>
            </div>
          ) : (
            <iframe
              src={url}
              title={name}
              className="h-[70vh] w-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
