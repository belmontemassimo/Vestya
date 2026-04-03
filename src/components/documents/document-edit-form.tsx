"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, ChevronsUpDown, Plus, Search, X } from "lucide-react";
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
import type { TagOption } from "@/components/documents/document-upload-form";

const editSchema = z.object({
  name: z.string().min(1),
});

type EditValues = z.infer<typeof editSchema>;

interface DocumentTag {
  id: string;
  label: string;
  type: string;
}

interface DocumentEditFormProps {
  documentId: string;
  initialName: string;
  initialTags: DocumentTag[];
  tagOptions: readonly TagOption[];
  onSave: (values: {
    id: string;
    fileName: string;
    tags: Array<{ id: string; label: string; type: string }>;
  }) => Promise<{ success: boolean; error?: string }>;
  onComplete?: () => void;
}

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

export function DocumentEditForm({
  documentId,
  initialName,
  initialTags,
  tagOptions,
  onSave,
  onComplete,
}: DocumentEditFormProps) {
  const t = useTranslations("documents");
  const [isPending, setIsPending] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTags.map((tag) => tag.id),
  );
  const [customTags, setCustomTags] = useState<TagOption[]>(() => {
    const knownIds = new Set(tagOptions.map((o) => o.value));
    return initialTags
      .filter((tag) => !knownIds.has(tag.id))
      .map((tag) => ({ value: tag.id, label: tag.label, type: tag.type as TagOption["type"] }));
  });
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: initialName },
  });

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

  async function handleSubmit(values: EditValues) {
    setIsPending(true);
    try {
      const tagData = selectedTags.map((id) => {
        const opt = allTagOptions.find((o) => o.value === id);
        return { id, label: opt?.label ?? id, type: opt?.type ?? "custom" };
      });

      const result = await onSave({
        id: documentId,
        fileName: values.name,
        tags: tagData,
      });

      if (!result.success) {
        toast.error(result.error ?? t("error"));
        return;
      }

      toast.success(t("updated"));
      onComplete?.();
    } catch {
      toast.error(t("error"));
    } finally {
      setIsPending(false);
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
        <CardTitle>{t("editDocument")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("saveChanges")}
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
