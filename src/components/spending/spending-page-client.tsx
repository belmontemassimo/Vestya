"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SpendingSummaryCards } from "@/components/spending/spending-summary-cards";
import { SpendingTable, type SpendingRecord } from "@/components/spending/spending-table";
import { SpendingForm, type TagOption } from "@/components/spending/spending-form";
import { DocumentPreview } from "@/components/documents/document-preview";
import {
  createSpendingRecord,
  updateSpendingRecord,
  deleteSpendingRecord,
  attachDocumentToSpending,
  getSpendingDocumentUrl,
} from "@/actions/spending.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter } from "@/i18n/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface SpendingPageClientProps {
  records: readonly SpendingRecord[];
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  properties: readonly SelectOption[];
  tagOptions: readonly TagOption[];
}

export function SpendingPageClient({
  records,
  totalExpenses,
  totalIncome,
  netBalance,
  properties,
  tagOptions,
}: SpendingPageClientProps) {
  const t = useTranslations("spending");
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SpendingRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);

  async function handleCreate(values: Record<string, unknown>) {
    const result = await createSpendingRecord(values);
    if (result.success) {
      return { success: true, recordId: result.data.id };
    }
    return result;
  }

  async function handleFileAttach(recordId: string, file: File) {
    const result = await attachDocumentToSpending({
      recordId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    if (!result.success) return result;

    // Upload to S3
    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      });
      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.open("PUT", result.data.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    return { success: true };
  }

  function handleCreateSuccess() {
    setCreateDialogOpen(false);
    router.refresh();
  }

  async function handleUpdate(values: Record<string, unknown>) {
    if (!editRecord) return { success: false, error: "No record selected." };
    const result = await updateSpendingRecord({ ...values, id: editRecord.id });
    return result;
  }

  function handleEditSuccess() {
    setEditRecord(null);
    router.refresh();
  }

  async function handleDelete(recordId: string) {
    const result = await deleteSpendingRecord(recordId);
    if (result.success) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
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

  // Prepare edit defaults
  const editDefaults = editRecord
    ? {
        name: editRecord.name,
        amount: Number(editRecord.amount),
        recordType: editRecord.recordType as "EXPENSE" | "INCOME",
        date:
          typeof editRecord.date === "string"
            ? editRecord.date.split("T")[0]
            : editRecord.date.toISOString().split("T")[0],
        propertyId: editRecord.property?.id ?? "",
        notes: editRecord.notes ?? "",
        tags: parseTags(editRecord.tags),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addRecord")}
        </button>
      </PageHeader>

      <SpendingSummaryCards
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        netBalance={netBalance}
      />

      <SpendingTable
        records={records}
        onEdit={setEditRecord}
        onDelete={handleDelete}
        onPreviewDocument={handlePreviewDocument}
        onDownloadDocument={handleDownloadDocument}
        canEdit
        canDelete
      />

      {/* Create dialog */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={t("addRecord")}
      >
        <SpendingForm
          properties={properties}
          tagOptions={tagOptions}
          onSubmit={handleCreate}
          onFileAttach={handleFileAttach}
          onSuccess={handleCreateSuccess}
        />
      </FormDialog>

      {/* Edit dialog */}
      <FormDialog
        open={!!editRecord}
        onOpenChange={(open) => {
          if (!open) setEditRecord(null);
        }}
        title={t("editRecord")}
      >
        {editRecord && (
          <SpendingForm
            key={editRecord.id}
            isEditing
            properties={properties}
            tagOptions={tagOptions}
            defaultValues={editDefaults}
            onSubmit={handleUpdate}
            onSuccess={handleEditSuccess}
          />
        )}
      </FormDialog>

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
    </div>
  );
}

function parseTags(
  tags: unknown,
): Array<{ id: string; label: string; type: string }> {
  if (!Array.isArray(tags)) return [];
  return tags.filter(
    (t): t is { id: string; label: string; type: string } =>
      typeof t === "object" && t !== null && "label" in t && "type" in t,
  );
}
