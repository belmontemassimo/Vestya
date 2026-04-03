"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Upload, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUploadForm, type TagOption } from "@/components/documents/document-upload-form";
import { DocumentPreview } from "@/components/documents/document-preview";
import {
  createDocumentRecord,
  updateDocument,
  getDocumentDownloadUrl,
  deleteDocument,
} from "@/actions/document.actions";
import { DocumentEditForm } from "@/components/documents/document-edit-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentTag {
  id: string;
  label: string;
  type: string;
}

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

function parseTags(tags: unknown): DocumentTag[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter(
    (t): t is DocumentTag =>
      typeof t === "object" && t !== null && "label" in t && "type" in t,
  );
}

const TAG_PILL_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  member: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  contact: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  custom: "bg-violet-100 text-violet-700 hover:bg-violet-200",
};

const TAG_PILL_ACTIVE: Record<string, string> = {
  property: "ring-2 ring-blue-400",
  member: "ring-2 ring-emerald-400",
  contact: "ring-2 ring-amber-400",
  custom: "ring-2 ring-violet-400",
};

export function DocumentsPageClient({
  documents,
  tagOptions,
}: DocumentsPageClientProps) {
  const t = useTranslations("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const router = useRouter();

  // Collect all unique tags from documents (includes custom tags not in tagOptions)
  const allAvailableTags = useMemo(() => {
    const tagMap = new Map<string, DocumentTag>();
    for (const doc of documents) {
      for (const tag of parseTags(doc.tags)) {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      }
    }
    return Array.from(tagMap.values());
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return documents.filter((doc) => {
      const matchesName = !query || doc.fileName.toLowerCase().includes(query);
      const matchesTags =
        selectedFilterTags.length === 0 ||
        parseTags(doc.tags).some((tag) => selectedFilterTags.includes(tag.id));
      return matchesName && matchesTags;
    });
  }, [documents, searchQuery, selectedFilterTags]);

  function toggleFilterTag(tagId: string) {
    setSelectedFilterTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedFilterTags([]);
  }

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedFilterTags.length > 0;

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

  async function handleSaveEdit(values: {
    id: string;
    fileName: string;
    tags: Array<{ id: string; label: string; type: string }>;
  }) {
    const result = await updateDocument({
      id: values.id,
      fileName: values.fileName,
      tags: values.tags,
    });
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  function handleEditComplete() {
    setEditDoc(null);
    router.refresh();
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

      {/* Search and tag filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchDocuments")}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {allAvailableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{t("filterByTag")}:</span>
            {allAvailableTags.map((tag) => {
              const isActive = selectedFilterTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleFilterTag(tag.id)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
                    TAG_PILL_COLORS[tag.type] ?? "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    isActive && (TAG_PILL_ACTIVE[tag.type] ?? "ring-2 ring-slate-400"),
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs text-slate-500"
              >
                {t("clearFilters")}
              </Button>
            )}
          </div>
        )}
      </div>

      <DocumentList
        documents={filteredDocuments}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onEdit={setEditDoc}
        onDelete={handleDelete}
        canEdit
        canDelete
      />

      <FormDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} title={t("uploadDocument")}>
        <DocumentUploadForm
          tagOptions={tagOptions}
          onCreateRecord={handleCreateRecord}
          onComplete={handleComplete}
        />
      </FormDialog>

      <FormDialog open={!!editDoc} onOpenChange={(open) => { if (!open) setEditDoc(null); }} title={t("editDocument")}>
        {editDoc && (
          <DocumentEditForm
            key={editDoc.id}
            documentId={editDoc.id}
            initialName={editDoc.fileName}
            initialTags={parseTags(editDoc.tags)}
            tagOptions={tagOptions}
            onSave={handleSaveEdit}
            onComplete={handleEditComplete}
          />
        )}
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
