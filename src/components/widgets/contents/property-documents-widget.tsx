"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { DocumentUploadForm, type TagOption } from "@/components/documents/document-upload-form";
import { createDocumentRecord } from "@/actions/document.actions";

interface PropertyDocumentsWidgetProps {
  documents: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    createdAt: string;
  }>;
  propertyId?: string;
  tagOptions?: readonly TagOption[];
  autoSelectedTags?: string[];
}

export function PropertyDocumentsWidget({ documents, propertyId, tagOptions = [], autoSelectedTags }: PropertyDocumentsWidgetProps) {
  const t = useTranslations("documents");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

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
      propertyId,
    });
    if (result.success) {
      return { success: true, uploadUrl: result.data.uploadUrl };
    }
    return { success: false, error: result.error };
  }

  function handleComplete() {
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <WidgetHeader title={t("title")} onAdd={() => setDialogOpen(true)} addLabel={t("upload")} />
        {documents.length === 0 ? (
          <p className="text-xs italic text-slate-400">{t("emptyTitle")}</p>
        ) : (
          <div className="space-y-1.5 overflow-y-auto">
            {documents.slice(0, 8).map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                  {doc.fileName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("uploadDocument")}>
        <DocumentUploadForm
          tagOptions={tagOptions}
          defaultSelectedTags={autoSelectedTags}
          onCreateRecord={handleCreateRecord}
          onComplete={handleComplete}
        />
      </FormDialog>
    </>
  );
}
