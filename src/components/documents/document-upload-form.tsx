"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

type UploadValues = z.infer<typeof uploadSchema>;

export interface TagOption {
  value: string;
  label: string;
  type: "property" | "member" | "contact";
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

  function toggleTag(value: string) {
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
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
        const opt = tagOptions.find((o) => o.value === id);
        return { id, label: opt?.label ?? id, type: opt?.type ?? "property" };
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

  const propertyTags = tagOptions.filter((o) => o.type === "property");
  const memberTags = tagOptions.filter((o) => o.type === "member");
  const contactTags = tagOptions.filter((o) => o.type === "contact");

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

            {/* Tags multi-select dropdown */}
            <div className="space-y-2">
              <FormLabel>{t("tags")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-sm text-slate-500">
                      {selectedTags.length > 0
                        ? `${selectedTags.length} selected`
                        : t("selectTags")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {propertyTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Properties
                      </div>
                    )}
                    {propertyTags.map((opt) => {
                      const selected = selectedTags.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleTag(opt.value)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                        >
                          <div className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            selected ? "border-blue-500 bg-blue-500" : "border-slate-300",
                          )}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                    {memberTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Members
                      </div>
                    )}
                    {memberTags.map((opt) => {
                      const selected = selectedTags.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleTag(opt.value)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                        >
                          <div className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            selected ? "border-emerald-500 bg-emerald-500" : "border-slate-300",
                          )}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                    {contactTags.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Contacts
                      </div>
                    )}
                    {contactTags.map((opt) => {
                      const selected = selectedTags.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleTag(opt.value)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                        >
                          <div className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            selected ? "border-amber-500 bg-amber-500" : "border-slate-300",
                          )}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                    {tagOptions.length === 0 && (
                      <p className="px-2 py-3 text-center text-xs text-slate-400">{t("noTagsAvailable")}</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {/* Selected tags displayed as pills */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((id) => {
                    const opt = tagOptions.find((o) => o.value === id);
                    if (!opt) return null;
                    return (
                      <span
                        key={id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          opt.type === "property"
                            ? "bg-blue-100 text-blue-700"
                            : opt.type === "contact"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700",
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
