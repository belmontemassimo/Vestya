"use client";

import { FileText, Image, File } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/utils";

interface DocumentsWidgetProps {
  documents: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    createdAt: string;
    uploadedByName?: string;
  }>;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  return File;
}

export function DocumentsWidget({ documents }: DocumentsWidgetProps) {
  const t = useTranslations("documents");

  if (documents.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noDocuments")}
      </p>
    );
  }

  const displayed = documents.slice(0, 5);

  return (
    <div className="space-y-2.5">
      {displayed.map((doc) => {
        const IconComponent = getFileIcon(doc.mimeType);
        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
          >
            <IconComponent className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {doc.fileName}
              </p>
              <p className="text-xs text-slate-400">
                {formatDateShort(doc.createdAt)}
                {doc.uploadedByName && (
                  <span className="ml-1.5">{doc.uploadedByName}</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
