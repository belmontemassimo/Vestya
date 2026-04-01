"use client";

import { FileText } from "lucide-react";
import { useLocale } from "next-intl";
import { formatDateShort } from "@/lib/utils";

interface PropertyDocumentsWidgetProps {
  documents: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    createdAt: string;
  }>;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "img";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "xls";
  if (mimeType.includes("document") || mimeType.includes("word")) return "doc";
  return "file";
}

export function PropertyDocumentsWidget({
  documents,
}: PropertyDocumentsWidgetProps) {
  const locale = useLocale();
  const visible = documents.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <FileText className="h-8 w-8" />
        <p className="text-sm">No documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {doc.fileName}
            </p>
            <p className="text-xs text-slate-400">
              {getFileIcon(doc.mimeType).toUpperCase()} &middot;{" "}
              {formatDateShort(doc.createdAt, locale)}
            </p>
          </div>
        </div>
      ))}
      {documents.length > 5 && (
        <p className="text-center text-xs text-slate-400">
          +{documents.length - 5} more
        </p>
      )}
    </div>
  );
}
