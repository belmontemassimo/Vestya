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
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user?: { id: string; name: string | null; email: string; image: string | null };
  defaultValues?: { name: string; email: string };
  onUpdateProfile?: (values: ProfileValues) => Promise<{ success: boolean; error?: string }>;
  onChangePassword?: (values: PasswordValues) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileForm({
  user,
  defaultValues: defaultValuesProp,
  onUpdateProfile,
  onChangePassword,
}: ProfileFormProps) {
  const defaultValues = defaultValuesProp ?? {
    name: user?.name ?? "",
    email: user?.email ?? "",
  };

  async function handleUpdateProfile(values: ProfileValues) {
    if (onUpdateProfile) return onUpdateProfile(values);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    return { success: res.ok, error: data.error };
  }

  async function handleChangePassword(values: PasswordValues) {
    if (onChangePassword) return onChangePassword(values);
    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    return { success: res.ok, error: data.error };
  }

  return (
    <div className="space-y-6">
      <ProfileSection
        defaultValues={defaultValues}
        onSubmit={handleUpdateProfile}
      />
      <PasswordSection onSubmit={handleChangePassword} />
    </div>
  );
}

function ProfileSection({
  defaultValues,
  onSubmit,
}: {
  defaultValues: { name: string; email: string };
  onSubmit: (values: ProfileValues) => Promise<{ success: boolean; error?: string }>;
}) {
  const t = useTranslations("settings");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: defaultValues.name },
  });

  async function handleSubmit(values: ProfileValues) {
    setIsPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success(t("profileUpdated"));
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile")}</CardTitle>
        <CardDescription>{t("profileDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <label className="text-sm font-medium">{t("email")}</label>
              <Input value={defaultValues.email} disabled className="mt-2" />
              <p className="text-xs text-slate-500 mt-1">
                {t("emailReadOnly")}
              </p>
            </div>
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

function PasswordSection({
  onSubmit,
}: {
  onSubmit: (values: PasswordValues) => Promise<{ success: boolean; error?: string }>;
}) {
  const t = useTranslations("settings");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(values: PasswordValues) {
    setIsPending(true);
    try {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success(t("passwordChanged"));
        form.reset();
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("changePassword")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("updatePassword")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
