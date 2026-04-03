"use client";

import { useTranslations, useLocale } from "next-intl";
import { FileText, Download, Trash2, Eye, Pencil } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface DocumentTag {
  id: string;
  label: string;
  type: string;
}

interface Document {
  id: string;
  fileName: string;
  mimeType?: string;
  tags?: unknown;
  property?: { id: string; name: string } | null;
  uploader?: { id: string; name: string | null };
  createdAt: Date | string;
  sizeBytes?: number;
}

interface DocumentListProps {
  documents: readonly Document[];
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (docId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseTags(tags: unknown): DocumentTag[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter(
    (t): t is DocumentTag =>
      typeof t === "object" && t !== null && "label" in t && "type" in t,
  );
}

const TAG_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700",
  member: "bg-emerald-100 text-emerald-700",
  contact: "bg-amber-100 text-amber-700",
};

export function DocumentList({
  documents,
  onDownload,
  onPreview,
  onEdit,
  onDelete,
  canEdit = false,
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
            <TableHead>{t("tags")}</TableHead>
            <TableHead>{t("uploadedBy")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("size")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const tags = parseTags(doc.tags);
            return (
              <TableRow key={doc.id}>
                <TableCell>
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:underline text-left"
                    onClick={() => onPreview?.(doc)}
                  >
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium truncate max-w-[200px]">
                      {doc.fileName}
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          TAG_COLORS[tag.type] ?? "bg-slate-100 text-slate-600",
                        )}
                      >
                        {tag.label}
                      </span>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {doc.uploader?.name ?? "—"}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {formatDateShort(
                    typeof doc.createdAt === "string"
                      ? doc.createdAt
                      : doc.createdAt.toISOString(),
                    locale,
                  )}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {formatFileSize(doc.sizeBytes ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onPreview?.(doc)} title={t("preview")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDownload?.(doc)} title={t("download")}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit?.(doc)} title={t("edit")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete?.(doc.id)} title={t("delete")}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
