"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
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

const CATEGORIES = [
  "PLUMBER", "ELECTRICIAN", "GARDENER", "CLEANER", "HANDYMAN",
  "REAL_ESTATE_AGENT", "NOTARY", "LAWYER", "INSURANCE", "PROPERTY_MANAGER",
  "TENANT", "NEIGHBOR", "CONTRACTOR", "ARCHITECT", "LOCKSMITH",
  "PEST_CONTROL", "HVAC", "ROOFER", "PAINTER", "OTHER",
] as const;

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  category: z.enum(CATEGORIES),
  notes: z.string().optional(),
  phones: z.array(z.object({ value: z.string() })),
  emails: z.array(z.object({ value: z.string() })),
});

type ContactValues = z.infer<typeof contactSchema>;

interface PropertyOption {
  id: string;
  name: string;
}

interface ContactFormProps {
  defaultValues?: Partial<ContactValues>;
  isEditing?: boolean;
  properties?: readonly PropertyOption[];
  linkedPropertyIds?: string[];
  onSubmit: (values: ContactValues) => Promise<{ success: boolean; error?: string }>;
  onPropertyLinksChange?: (propertyIds: string[]) => Promise<void>;
}

export function ContactForm({
  defaultValues,
  isEditing = false,
  properties = [],
  linkedPropertyIds = [],
  onSubmit,
  onPropertyLinksChange,
}: ContactFormProps) {
  const t = useTranslations("contacts");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>(linkedPropertyIds);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      category: "OTHER",
      notes: "",
      phones: [{ value: "" }],
      emails: [{ value: "" }],
      ...defaultValues,
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control: form.control, name: "phones" });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ control: form.control, name: "emails" });

  function toggleProperty(id: string) {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(values: ContactValues) {
    setIsPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        if (isEditing && onPropertyLinksChange) {
          await onPropertyLinksChange(selectedProperties);
        }
        toast.success(isEditing ? t("updated") : t("created"));
        router.push("/contacts");
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? t("editContact") : t("addContact")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("company")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                          <SelectValue />
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

            <div>
              <FormLabel className="mb-2 block">{t("phoneNumbers")}</FormLabel>
              <div className="space-y-2">
                {phoneFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`phones.${index}.value`}
                      render={({ field: phoneField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={t("phonePlaceholder")}
                              {...phoneField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {phoneFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPhone({ value: "" })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("addPhone")}
                </Button>
              </div>
            </div>

            <div>
              <FormLabel className="mb-2 block">{t("emailAddresses")}</FormLabel>
              <div className="space-y-2">
                {emailFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`emails.${index}.value`}
                      render={({ field: emailField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t("emailPlaceholder")}
                              {...emailField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {emailFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendEmail({ value: "" })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("addEmail")}
                </Button>
              </div>
            </div>

            {isEditing && properties.length > 0 && (
              <div>
                <FormLabel className="mb-2 block">{t("linkedProperties")}</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {properties.map((p) => {
                    const isLinked = selectedProperties.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProperty(p.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          isLinked
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300",
                        )}
                      >
                        {isLinked && <Check className="h-3 w-3" />}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
