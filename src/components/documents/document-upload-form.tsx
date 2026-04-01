"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  propertyId: z.string().min(1),
  category: z.string().optional(),
});

type UploadValues = z.infer<typeof uploadSchema>;

interface SelectOption {
  value: string;
  label: string;
}

interface DocumentUploadFormProps {
  properties: readonly SelectOption[];
  onCreateRecord: (
    values: UploadValues & { fileName: string; fileType: string; fileSize: number }
  ) => Promise<{ success: boolean; uploadUrl?: string; error?: string }>;
  onComplete?: () => void;
}

const CATEGORIES = ["DEED", "CONTRACT", "INVOICE", "INSURANCE", "TAX", "PHOTO", "OTHER"] as const;

export function DocumentUploadForm({
  properties,
  onCreateRecord,
  onComplete,
}: DocumentUploadFormProps) {
  const t = useTranslations("documents");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { name: "", propertyId: "", category: "" },
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(values: UploadValues) {
    if (!file) {
      toast.error(t("noFileSelected"));
      return;
    }

    setIsPending(true);
    setUploadProgress(0);

    try {
      const result = await onCreateRecord({
        ...values,
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
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", result.uploadUrl!);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      toast.success(t("uploaded"));
      form.reset();
      clearFile();
      onComplete?.();
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setIsPending(false);
      setUploadProgress(0);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("uploadDocument")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
                file
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={clearFile}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 mb-2">
                    {t("dropOrClick")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("selectFile")}
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t("uploading")}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("property")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectProperty")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("categoryLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCategory")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {t(`category.${cat}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending || !file}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("upload")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
