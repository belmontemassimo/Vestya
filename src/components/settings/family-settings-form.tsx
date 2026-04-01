"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateFamily } from "@/actions/family.actions";

const familySettingsSchema = z.object({
  name: z.string().min(1).max(100),
});

type FamilySettingsValues = z.infer<typeof familySettingsSchema>;

interface FamilyData {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
}

interface FamilySettingsFormProps {
  family?: FamilyData;
  currentUserRole?: string | null;
  defaultValues?: FamilySettingsValues;
}

export function FamilySettingsForm({
  family,
  defaultValues: defaultValuesProp,
}: FamilySettingsFormProps) {
  const defaultValues: FamilySettingsValues = defaultValuesProp ?? {
    name: family?.name ?? "",
  };
  const t = useTranslations("settings");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FamilySettingsValues>({
    resolver: zodResolver(familySettingsSchema),
    defaultValues,
  });

  async function handleSubmit(values: FamilySettingsValues) {
    setIsPending(true);
    try {
      const result = await updateFamily(values);
      if (result.success) {
        toast.success(t("familyUpdated"));
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
        <CardTitle>{t("familySettings")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("familyName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("familyNameDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
