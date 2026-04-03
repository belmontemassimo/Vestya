"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Tag,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { SpendingForm } from "@/components/spending/spending-form";
import { DocumentPreview } from "@/components/documents/document-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TagOption } from "@/components/spending/spending-form";
import {
  createSpendingRecord,
  getSpendingDocumentUrl,
} from "@/actions/spending.actions";

interface RecordTag {
  id: string;
  label: string;
  type: string;
}

interface SpendingRecord {
  id: string;
  name: string;
  amount: number;
  recordType: string;
  date: string;
  notes: string | null;
  tags?: unknown;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SpendingWidgetProps {
  totalExpenses: number;
  totalIncome: number;
  records?: SpendingRecord[];
  currency?: string;
  propertyId?: string;
  propertyName?: string;
  properties?: readonly SelectOption[];
  tagOptions?: readonly TagOption[];
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

export function SpendingWidget({
  totalExpenses,
  totalIncome,
  records = [],
  currency = "EUR",
  propertyId,
  propertyName,
  properties = [],
  tagOptions = [],
}: SpendingWidgetProps) {
  const t = useTranslations("spending");
  const locale = useLocale();
  const router = useRouter();
  const net = totalIncome - totalExpenses;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SpendingRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);

  const recentRecords = records.slice(0, 6);

  async function handleCreate(
    values: Record<string, unknown>,
    file?: File,
  ) {
    const input = {
      ...values,
      ...(propertyId ? { propertyId } : {}),
      ...(file
        ? {
            file: {
              fileName: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
            },
          }
        : {}),
    };

    const result = await createSpendingRecord(
      input as unknown as Parameters<typeof createSpendingRecord>[0],
    );

    if (!result.success) return result;

    // Upload file to S3 if presigned URL was returned
    if (file && result.data.uploadUrl) {
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () =>
          reject(new Error("Upload failed")),
        );
        xhr.open("PUT", result.data.uploadUrl!);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    }

    return { success: true };
  }

  function handleCreateSuccess() {
    setDialogOpen(false);
    router.refresh();
  }

  async function handlePreviewDocument(recordId: string) {
    const result = await getSpendingDocumentUrl(recordId);
    if (result.success) {
      setPreviewDoc({
        url: result.data.downloadUrl,
        name: result.data.fileName,
        mimeType: result.data.mimeType,
      });
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  async function handleDownloadDocument(recordId: string) {
    const result = await getSpendingDocumentUrl(recordId);
    if (result.success) {
      window.open(result.data.downloadUrl, "_blank");
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <WidgetHeader
          title={t("title")}
          onAdd={() => setDialogOpen(true)}
          addLabel={t("addRecord")}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {recentRecords.length === 0 ? (
            <p className="text-xs italic text-slate-400">{t("noRecords")}</p>
          ) : (
            <div className="space-y-1.5">
              {recentRecords.map((record) => {
                const isIncome = record.recordType === "INCOME";
                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setDetailRecord(record)}
                    className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-100"
                  >
                    <span className="truncate text-xs font-medium text-slate-700">
                      {record.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-semibold",
                        isIncome ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(record.amount, currency, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="border-t border-slate-200 my-2" />

        <div className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {t("totalExpenses")}
            </span>
            <span className="text-[11px] font-semibold text-red-600">
              -{formatCurrency(totalExpenses, currency, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {t("totalIncome")}
            </span>
            <span className="text-[11px] font-semibold text-green-600">
              +{formatCurrency(totalIncome, currency, locale)}
            </span>
          </div>
          <div className="border-t border-slate-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-900">Net</span>
            <span
              className={cn(
                "text-xs font-bold",
                net >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {net >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(net), currency, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Create dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("addRecord")}
      >
        <SpendingForm
          properties={properties}
          tagOptions={tagOptions}
          showPropertyField={!propertyId}
          onSubmit={handleCreate}
          onSuccess={handleCreateSuccess}
          defaultValues={propertyId ? { propertyId } : undefined}
        />
      </FormDialog>

      {/* Record detail dialog */}
      {detailRecord && (
        <RecordDetailDialog
          record={detailRecord}
          propertyName={propertyName}
          currency={currency}
          locale={locale}
          open={!!detailRecord}
          onOpenChange={(open) => {
            if (!open) setDetailRecord(null);
          }}
          onPreviewDocument={handlePreviewDocument}
          onDownloadDocument={handleDownloadDocument}
        />
      )}

      {/* Document preview */}
      <DocumentPreview
        open={!!previewDoc}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
        url={previewDoc?.url ?? ""}
        name={previewDoc?.name ?? ""}
        mimeType={previewDoc?.mimeType ?? ""}
      />
    </>
  );
}

function RecordDetailDialog({
  record,
  propertyName,
  currency,
  locale,
  open,
  onOpenChange,
  onPreviewDocument,
  onDownloadDocument,
}: {
  record: SpendingRecord;
  propertyName?: string;
  currency: string;
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreviewDocument: (recordId: string) => void;
  onDownloadDocument: (recordId: string) => void;
}) {
  const t = useTranslations("spending");
  const isIncome = record.recordType === "INCOME";
  const tags = parseTags(record.tags);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{record.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t("amount")}</span>
            <span
              className={cn(
                "text-lg font-bold",
                isIncome ? "text-green-600" : "text-red-600",
              )}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(record.amount, currency, locale)}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t("typeLabel")}</span>
            <Badge variant={isIncome ? "success" : "destructive"}>
              {t(`type.${record.recordType}`)}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              <Calendar className="mr-1.5 inline h-3.5 w-3.5" />
              {t("date")}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {formatDateShort(record.date, locale)}
            </span>
          </div>

          {/* Property */}
          {propertyName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t("property")}</span>
              <span className="text-sm font-medium text-slate-700">
                {propertyName}
              </span>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-sm text-slate-500">
                <Tag className="mr-1.5 inline h-3.5 w-3.5" />
                {t("tags")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      TAG_COLORS[tag.type] ?? "bg-slate-100 text-slate-600",
                    )}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="space-y-1.5">
              <span className="text-sm text-slate-500">
                <StickyNote className="mr-1.5 inline h-3.5 w-3.5" />
                {t("description")}
              </span>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {record.notes}
              </p>
            </div>
          )}

          {/* Document actions */}
          <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="flex-1 text-sm text-slate-500">
              {t("document")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreviewDocument(record.id)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {t("previewDocument")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadDocument(record.id)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t("downloadDocument")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SpendingRecord {
  id: string;
  name: string;
  amount: number;
  recordType: string;
  date: string;
  notes: string | null;
  tags?: unknown;
}
