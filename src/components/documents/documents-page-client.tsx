"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUploadForm, type TagOption } from "@/components/documents/document-upload-form";
import { DocumentPreview } from "@/components/documents/document-preview";
import {
  createDocumentRecord,
  getDocumentDownloadUrl,
  deleteDocument,
} from "@/actions/document.actions";
import { FormDialog } from "@/components/shared/form-dialog";

interface DocumentItem {
  id: string;
  fileName: string;
  mimeType?: string;
  tags?: unknown;
  property?: { id: string; name: string } | null;
  uploader?: { id: string; name: string | null };
  createdAt: Date | string;
  sizeBytes?: number;
}

interface DocumentsPageClientProps {
  documents: readonly DocumentItem[];
  tagOptions: readonly TagOption[];
}

export function DocumentsPageClient({
  documents,
  tagOptions,
}: DocumentsPageClientProps) {
  const t = useTranslations("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const router = useRouter();

  async function handleCreateRecord(values: {
    name: string;
    tags: Array<{ id: string; label: string; type: string }>;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) {
    const result = await createDocumentRecord({
      fileName: values.name,
      mimeType: values.fileType,
      sizeBytes: values.fileSize,
      tags: values.tags,
    });
    if (result.success) {
      return { success: true, uploadUrl: result.data.uploadUrl };
    }
    return { success: false, error: result.error };
  }

  function handleComplete() {
    setUploadDialogOpen(false);
    router.refresh();
  }

  async function handleDownload(doc: DocumentItem) {
    const result = await getDocumentDownloadUrl(doc.id);
    if (result.success) {
      window.open(result.data.downloadUrl, "_blank");
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  async function handlePreview(doc: DocumentItem) {
    const result = await getDocumentDownloadUrl(doc.id);
    if (result.success) {
      setPreviewDoc({
        url: result.data.downloadUrl,
        name: doc.fileName,
        mimeType: doc.mimeType ?? "",
      });
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  async function handleDelete(docId: string) {
    const result = await deleteDocument(docId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setUploadDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          {t("upload")}
        </button>
      </PageHeader>

      <DocumentList
        documents={documents}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onDelete={handleDelete}
        canDelete
      />

      <FormDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} title={t("uploadDocument")}>
        <DocumentUploadForm
          tagOptions={tagOptions}
          onCreateRecord={handleCreateRecord}
          onComplete={handleComplete}
        />
      </FormDialog>

      <DocumentPreview
        open={!!previewDoc}
        onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
        url={previewDoc?.url ?? ""}
        name={previewDoc?.name ?? ""}
        mimeType={previewDoc?.mimeType ?? ""}
      />
    </div>
  );
}
