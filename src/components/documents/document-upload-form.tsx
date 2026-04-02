"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const uploadSchema = z.object({
  name: z.string().min(1),
});

const TAG_PILL_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700",
  member: "bg-emerald-100 text-emerald-700",
  contact: "bg-amber-100 text-amber-700",
  custom: "bg-violet-100 text-violet-700",
};

const TAG_CHECK_COLORS: Record<string, string> = {
  blue: "border-blue-500 bg-blue-500",
  emerald: "border-emerald-500 bg-emerald-500",
  amber: "border-amber-500 bg-amber-500",
  violet: "border-violet-500 bg-violet-500",
};

type UploadValues = z.infer<typeof uploadSchema>;

export interface TagOption {
  value: string;
  label: string;
  type: "property" | "member" | "contact" | "custom";
}

interface DocumentUploadFormProps {
  tagOptions: readonly TagOption[];
  defaultSelectedTags?: string[];
  onCreateRecord: (values: {
    name: string;
    tags: Array<{ id: string; label: string; type: string }>;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => Promise<{ success: boolean; uploadUrl?: string; error?: string }>;
  onComplete?: () => void;
}

export function DocumentUploadForm({
  tagOptions,
  defaultSelectedTags,
  onCreateRecord,
  onComplete,
}: DocumentUploadFormProps) {
  const t = useTranslations("documents");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultSelectedTags ?? []);
  const [customTags, setCustomTags] = useState<TagOption[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { name: "" },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
    if (selectedFile && !form.getValues("name")) {
      form.setValue("name", selectedFile.name.replace(/\.[^.]+$/, ""));
    }
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const allTagOptions = [...tagOptions, ...customTags];

  function toggleTag(value: string) {
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  }

  function createCustomTag(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const exists = allTagOptions.some(
      (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return;
    const id = `custom-${trimmed.toLowerCase().replace(/\s+/g, "-")}`;
    setCustomTags((prev) => [...prev, { value: id, label: trimmed, type: "custom" as TagOption["type"] }]);
    setSelectedTags((prev) => [...prev, id]);
    setTagSearch("");
  }

  async function handleSubmit(values: UploadValues) {
    if (!file) {
      toast.error(t("noFileSelected"));
      return;
    }

    setIsPending(true);
    setUploadProgress(0);

    try {
      const tagData = selectedTags.map((id) => {
        const opt = allTagOptions.find((o) => o.value === id);
        return { id, label: opt?.label ?? id, type: opt?.type ?? "custom" };
      });

      const result = await onCreateRecord({
        name: values.name,
        tags: tagData,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!result.success || !result.uploadUrl) {
        toast.error(result.error ?? t("error"));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", result.uploadUrl!);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      toast.success(t("uploaded"));
      form.reset();
      setSelectedTags([]);
      clearFile();
      onComplete?.();
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setIsPending(false);
      setUploadProgress(0);
    }
  }

  const searchLower = tagSearch.toLowerCase();
  const filteredOptions = allTagOptions.filter(
    (o) => !tagSearch || o.label.toLowerCase().includes(searchLower),
  );
  const propertyTags = filteredOptions.filter((o) => o.type === "property");
  const memberTags = filteredOptions.filter((o) => o.type === "member");
  const contactTags = filteredOptions.filter((o) => o.type === "contact");
  const customTagsFiltered = filteredOptions.filter((o) => o.type === "custom");
  const hasExactMatch = allTagOptions.some(
    (o) => o.label.toLowerCase() === searchLower,
  );
  const showCreateOption = tagSearch.trim().length > 0 && !hasExactMatch;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("uploadDocument")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* File drop zone */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
                file ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300",
              )}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{file.name}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 mb-2">{t("dropOrClick")}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    {t("selectFile")}
                  </Button>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Upload progress */}
            {isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t("uploading")}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Document name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("documentName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags multi-select */}
            <div className="space-y-2">
              <FormLabel>{t("tags")}</FormLabel>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between font-normal"
                onClick={() => setTagDropdownOpen((prev) => !prev)}
              >
                <span className="truncate text-sm text-slate-500">
                  {selectedTags.length > 0
                    ? `${selectedTags.length} selected`
                    : t("selectTags")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>

              {tagDropdownOpen && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  {/* Search input */}
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && showCreateOption) {
                          e.preventDefault();
                          createCustomTag(tagSearch);
                        }
                      }}
                      placeholder={t("searchTags")}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  {/* Scrollable tag list */}
                  <div className="max-h-52 overflow-y-auto overscroll-contain p-1">
                    {propertyTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Properties
                      </div>
                    )}
                    {propertyTags.map((opt) => (
                      <TagCheckbox key={opt.value} opt={opt} selected={selectedTags.includes(opt.value)} color="blue" onToggle={toggleTag} />
                    ))}
                    {memberTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Members
                      </div>
                    )}
                    {memberTags.map((opt) => (
                      <TagCheckbox key={opt.value} opt={opt} selected={selectedTags.includes(opt.value)} color="emerald" onToggle={toggleTag} />
                    ))}
                    {contactTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Contacts
                      </div>
                    )}
                    {contactTags.map((opt) => (
                      <TagCheckbox key={opt.value} opt={opt} selected={selectedTags.includes(opt.value)} color="amber" onToggle={toggleTag} />
                    ))}
                    {customTagsFiltered.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Custom
                      </div>
                    )}
                    {customTagsFiltered.map((opt) => (
                      <TagCheckbox key={opt.value} opt={opt} selected={selectedTags.includes(opt.value)} color="violet" onToggle={toggleTag} />
                    ))}
                    {filteredOptions.length === 0 && !showCreateOption && (
                      <p className="px-2 py-3 text-center text-xs text-slate-400">{t("noTagsFound")}</p>
                    )}
                  </div>

                  {/* Create new tag */}
                  {showCreateOption && (
                    <div className="border-t px-1 py-1">
                      <button
                        type="button"
                        onClick={() => createCustomTag(tagSearch)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-violet-600 hover:bg-violet-50"
                      >
                        <Plus className="h-4 w-4" />
                        {t("createTag", { name: tagSearch.trim() })}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Selected tags displayed as pills */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((id) => {
                    const opt = allTagOptions.find((o) => o.value === id);
                    if (!opt) return null;
                    return (
                      <span
                        key={id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          TAG_PILL_COLORS[opt.type] ?? "bg-slate-100 text-slate-700",
                        )}
                      >
                        {opt.label}
                        <button
                          type="button"
                          onClick={() => toggleTag(id)}
                          className="ml-0.5 hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending || !file}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("upload")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function TagCheckbox({
  opt,
  selected,
  color,
  onToggle,
}: {
  opt: TagOption;
  selected: boolean;
  color: string;
  onToggle: (value: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(opt.value)}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
    >
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          selected ? TAG_CHECK_COLORS[color] ?? "border-slate-500 bg-slate-500" : "border-slate-300",
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className="truncate">{opt.label}</span>
    </button>
  );
}
