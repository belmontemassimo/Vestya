"use client";

import { useTranslations, useLocale } from "next-intl";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

interface Document {
  id: string;
  name?: string;
  fileName?: string;
  mimeType?: string;
  propertyName?: string;
  property?: { id: string; name: string } | null;
  uploadedBy?: string;
  uploader?: { id: string; name: string | null };
  createdAt: Date | string;
  fileSize?: number;
  sizeBytes?: number;
  url?: string;
}

interface DocumentListProps {
  documents: readonly Document[];
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  onDelete?: (docId: string) => void;
  canDelete?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  onDownload,
  onPreview,
  onDelete,
  canDelete = false,
}: DocumentListProps) {
  const t = useTranslations("documents");
  const locale = useLocale();

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("fileName")}</TableHead>
            <TableHead>{t("property")}</TableHead>
            <TableHead>{t("uploadedBy")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("size")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <button
                  type="button"
                  className="flex items-center gap-2 hover:underline text-left"
                  onClick={() => onPreview?.(doc)}
                >
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">
                    {doc.name ?? doc.fileName}
                  </span>
                </button>
              </TableCell>
              <TableCell className="text-slate-600">
                {doc.propertyName ?? doc.property?.name ?? "—"}
              </TableCell>
              <TableCell className="text-slate-600">
                {doc.uploadedBy ?? doc.uploader?.name ?? "—"}
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {formatDateShort(
                  typeof doc.createdAt === "string"
                    ? doc.createdAt
                    : doc.createdAt.toISOString(),
                  locale
                )}
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {formatFileSize(doc.fileSize ?? doc.sizeBytes ?? 0)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreview?.(doc)}
                    title={t("preview")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload?.(doc)}
                    title={t("download")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(doc.id)}
                      title={t("delete")}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
