"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

const TYPES = ["EXPENSE", "INCOME"] as const;
const CATEGORIES = [
  "MORTGAGE", "INSURANCE", "TAX", "UTILITY", "MAINTENANCE", "REPAIR",
  "RENOVATION", "RENT_INCOME", "MANAGEMENT_FEE", "HOA_FEE", "FURNISHING",
  "LEGAL", "SALARY", "OTHER",
] as const;
const PAYMENT_STATUSES = ["PAID", "PENDING", "OVERDUE", "CANCELLED", "REFUNDED"] as const;

const spendingSchema = z.object({
  amount: z.coerce.number().positive(),
  recordType: z.enum(TYPES),
  category: z.enum(CATEGORIES),
  notes: z.string().optional(),
  date: z.string().min(1),
  propertyId: z.string().optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  currency: z.string().default("EUR"),
});

type SpendingValues = z.infer<typeof spendingSchema>;

interface SelectOption {
  value: string;
  label: string;
}

interface SpendingFormProps {
  defaultValues?: Partial<SpendingValues>;
  isEditing?: boolean;
  properties: readonly SelectOption[];
  onSubmit: (values: SpendingValues) => Promise<{ success: boolean; error?: string }>;
}

export function SpendingForm({
  defaultValues,
  isEditing = false,
  properties,
  onSubmit,
}: SpendingFormProps) {
  const t = useTranslations("spending");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<SpendingValues>({
    // z.coerce.number() widens the schema input type to `unknown`, which
    // breaks react-hook-form's Resolver generics. The cast is safe because
    // zodResolver validates and coerces the value at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(spendingSchema) as any,
    defaultValues: {
      amount: 0,
      recordType: "EXPENSE",
      category: "OTHER",
      notes: "",
      date: "",
      propertyId: "",
      paymentStatus: "PENDING",
      currency: "EUR",
      ...defaultValues,
    },
  });

  async function handleSubmit(values: SpendingValues) {
    setIsPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success(isEditing ? t("updated") : t("created"));
        router.push("/spending");
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
          {isEditing ? t("editRecord") : t("addRecord")}
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
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("typeLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
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
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentStatus")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`paymentStatus.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
