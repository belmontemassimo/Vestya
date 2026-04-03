"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  DollarSign,
  Pencil,
  Trash2,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
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

interface RecordTag {
  id: string;
  label: string;
  type: string;
}

export interface SpendingRecord {
  id: string;
  name: string;
  date: Date | string;
  amount: unknown;
  recordType: string;
  tags?: unknown;
  notes?: string | null;
  hasDocument?: boolean;
  property?: { id: string; name: string } | null;
}

interface SpendingTableProps {
  records: readonly SpendingRecord[];
  onEdit?: (record: SpendingRecord) => void;
  onDelete?: (recordId: string) => void;
  onPreviewDocument?: (recordId: string) => void;
  onDownloadDocument?: (recordId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function parseTags(tags: unknown): RecordTag[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter(
    (t): t is RecordTag =>
      typeof t === "object" && t !== null && "label" in t && "type" in t,
  );
}

const TAG_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700",
  member: "bg-emerald-100 text-emerald-700",
  contact: "bg-amber-100 text-amber-700",
  custom: "bg-violet-100 text-violet-700",
};

export function SpendingTable({
  records,
  onEdit,
  onDelete,
  onPreviewDocument,
  onDownloadDocument,
  canEdit = false,
  canDelete = false,
}: SpendingTableProps) {
  const t = useTranslations("spending");
  const locale = useLocale();

  if (records.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("tags")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead>{t("document")}</TableHead>
            <TableHead className="text-right">{t("deleteRecord")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const tags = parseTags(record.tags);
            const isIncome = record.recordType === "INCOME";
            return (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 truncate max-w-[220px]">
                      {record.name}
                    </span>
                    {record.notes && (
                      <span className="text-xs text-slate-400 truncate max-w-[220px]">
                        {record.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                  {formatDateShort(
                    typeof record.date === "string"
                      ? record.date
                      : record.date.toISOString(),
                    locale,
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
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
                <TableCell
                  className={cn(
                    "text-right text-sm font-medium whitespace-nowrap",
                    isIncome ? "text-green-600" : "text-red-600",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(Number(record.amount), "EUR", locale)}
                </TableCell>
                <TableCell>
                  {record.hasDocument ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onPreviewDocument?.(record.id)}
                        title={t("previewDocument")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDownloadDocument?.(record.id)}
                        title={t("downloadDocument")}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">
                      <FileText className="h-3.5 w-3.5 inline text-slate-300" />
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit?.(record)}
                        title={t("editRecord")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDelete?.(record.id)}
                        title={t("deleteRecord")}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
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
