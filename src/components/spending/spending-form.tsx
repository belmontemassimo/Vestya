"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Upload,
  X,
  Check,
  ChevronsUpDown,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const TYPES = ["EXPENSE", "INCOME"] as const;

const formSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  recordType: z.enum(TYPES),
  date: z.string().min(1),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface TagOption {
  value: string;
  label: string;
  type: "property" | "member" | "contact" | "custom";
}

interface SelectOption {
  value: string;
  label: string;
}

interface SpendingFormProps {
  defaultValues?: Partial<FormValues> & {
    tags?: Array<{ id: string; label: string; type: string }>;
  };
  defaultSelectedTags?: string[];
  isEditing?: boolean;
  showPropertyField?: boolean;
  properties: readonly SelectOption[];
  tagOptions?: readonly TagOption[];
  onSubmit: (
    values: {
      name: string;
      amount: number;
      recordType: string;
      date: string;
      propertyId?: string;
      tags: Array<{ id: string; label: string; type: string }>;
      notes?: string;
    },
    file?: File,
  ) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
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

const TAG_TYPE_COLOR: Record<string, string> = {
  property: "blue",
  member: "emerald",
  contact: "amber",
  custom: "violet",
};

export function SpendingForm({
  defaultValues,
  defaultSelectedTags,
  isEditing = false,
  showPropertyField = true,
  properties,
  tagOptions = [],
  onSubmit,
  onSuccess,
}: SpendingFormProps) {
  const t = useTranslations("spending");
  const [isPending, setIsPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tags state
  const initialTagIds = defaultSelectedTags ??
    defaultValues?.tags?.map((tag) => tag.id) ?? [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);
  const [customTags, setCustomTags] = useState<TagOption[]>(() => {
    const knownIds = new Set(tagOptions.map((o) => o.value));
    return (defaultValues?.tags ?? [])
      .filter((tag) => !knownIds.has(tag.id))
      .map((tag) => ({
        value: tag.id,
        label: tag.label,
        type: tag.type as TagOption["type"],
      }));
  });
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const allTagOptions = [...tagOptions, ...customTags];

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      recordType: "EXPENSE",
      date: "",
      propertyId: "",
      notes: "",
      ...defaultValues,
    },
  });

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
    setCustomTags((prev) => [
      ...prev,
      { value: id, label: trimmed, type: "custom" },
    ]);
    setSelectedTags((prev) => [...prev, id]);
    setTagSearch("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(values: FormValues) {
    setIsPending(true);
    try {
      const tagData = selectedTags.map((id) => {
        const opt = allTagOptions.find((o) => o.value === id);
        return { id, label: opt?.label ?? id, type: opt?.type ?? "custom" };
      });

      const result = await onSubmit(
        { ...values, tags: tagData },
        file ?? undefined,
      );

      if (!result.success) {
        toast.error(result.error ?? t("error"));
        return;
      }

      toast.success(isEditing ? t("updated") : t("created"));
      onSuccess?.();
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
  const groupedOptions = {
    property: filteredOptions.filter((o) => o.type === "property"),
    member: filteredOptions.filter((o) => o.type === "member"),
    contact: filteredOptions.filter((o) => o.type === "contact"),
    custom: filteredOptions.filter((o) => o.type === "custom"),
  };
  const hasExactMatch = allTagOptions.some(
    (o) => o.label.toLowerCase() === searchLower,
  );
  const showCreateOption = tagSearch.trim().length > 0 && !hasExactMatch;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? t("editRecord") : t("addRecord")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Type */}
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("typeLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`type.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("amount")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property */}
              {showPropertyField && properties.length > 0 && (
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("property")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("selectProperty")}
                            />
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
              )}
            </div>

            {/* Tags */}
            {allTagOptions.length > 0 && (
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
                      {(
                        ["property", "member", "contact", "custom"] as const
                      ).map((group) =>
                        groupedOptions[group].length > 0 ? (
                          <div key={group}>
                            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {group === "property"
                                ? "Properties"
                                : group === "member"
                                  ? "Members"
                                  : group === "contact"
                                    ? "Contacts"
                                    : "Custom"}
                            </div>
                            {groupedOptions[group].map((opt) => (
                              <TagCheckbox
                                key={opt.value}
                                opt={opt}
                                selected={selectedTags.includes(opt.value)}
                                color={TAG_TYPE_COLOR[opt.type] ?? "violet"}
                                onToggle={toggleTag}
                              />
                            ))}
                          </div>
                        ) : null,
                      )}
                      {filteredOptions.length === 0 && !showCreateOption && (
                        <p className="px-2 py-3 text-center text-xs text-slate-400">
                          {t("noTagsFound")}
                        </p>
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
                            TAG_PILL_COLORS[opt.type] ??
                              "bg-slate-100 text-slate-700",
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
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document attachment */}
            {!isEditing && (
              <div className="space-y-2">
                <FormLabel>{t("document")}</FormLabel>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
                    file
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300",
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
                      <Upload className="h-6 w-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500 mb-2">
                        {t("attachDocument")}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t("attachDocument")}
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
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onSuccess?.()}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? t("save") : t("create")}
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
          selected
            ? TAG_CHECK_COLORS[color] ?? "border-slate-500 bg-slate-500"
            : "border-slate-300",
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className="truncate">{opt.label}</span>
    </button>
  );
}
