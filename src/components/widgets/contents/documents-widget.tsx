"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getDocumentDownloadUrl, createDocumentRecord } from "@/actions/document.actions";
import { DocumentPreview } from "@/components/documents/document-preview";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { DocumentUploadForm, type TagOption } from "@/components/documents/document-upload-form";

interface DocumentTag {
  id: string;
  label: string;
  type: string;
}

interface WidgetDocument {
  id: string;
  fileName: string;
  mimeType: string;
  tags?: unknown;
  createdAt: string;
}

interface DocumentsWidgetProps {
  documents: WidgetDocument[];
  propertyId?: string;
  tagOptions?: readonly TagOption[];
  autoSelectedTags?: string[];
}

const TAG_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700",
  member: "bg-emerald-100 text-emerald-700",
  contact: "bg-amber-100 text-amber-700",
};

function parseTags(tags: unknown): DocumentTag[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter(
    (t): t is DocumentTag =>
      typeof t === "object" && t !== null && "label" in t && "type" in t,
  );
}

export function DocumentsWidget({ documents, propertyId, tagOptions = [], autoSelectedTags }: DocumentsWidgetProps) {
  const t = useTranslations("documents");
  const router = useRouter();
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handlePreview(
    e: React.MouseEvent,
    doc: WidgetDocument,
  ) {
    e.preventDefault();
    e.stopPropagation();
    const result = await getDocumentDownloadUrl(doc.id);
    if (result.success) {
      setPreview({
        url: result.data.downloadUrl,
        name: doc.fileName,
        mimeType: doc.mimeType,
      });
    } else {
      toast.error(result.error ?? "Failed to load preview");
    }
  }

  async function handleCreateRecord(values: {
    name: string;
    tags: Array<{ id: string; label: string; type: string }>;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) {
    const payload: Record<string, unknown> = {
      fileName: values.name,
      mimeType: values.fileType,
      sizeBytes: values.fileSize,
      tags: values.tags,
    };
    if (propertyId) {
      payload.propertyId = propertyId;
    }
    const result = await createDocumentRecord(payload);
    if (result.success) {
      return { success: true, uploadUrl: result.data.uploadUrl };
    }
    return { success: false, error: result.error };
  }

  function handleUploadComplete() {
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
            {documents.slice(0, 8).map((doc) => {
              const tags = parseTags(doc.tags);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={(e) => handlePreview(e, doc)}
                  className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-slate-100"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                    {doc.fileName}
                  </span>
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                        TAG_COLORS[tag.type] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {tag.label}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DocumentPreview
        open={!!preview}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
        url={preview?.url ?? ""}
        name={preview?.name ?? ""}
        mimeType={preview?.mimeType ?? ""}
      />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Upload Document">
        <DocumentUploadForm tagOptions={tagOptions} defaultSelectedTags={autoSelectedTags} onCreateRecord={handleCreateRecord} onComplete={handleUploadComplete} />
      </FormDialog>
    </>
  );
}
