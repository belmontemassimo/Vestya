"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createFamily, acceptInvitation } from "@/actions/family.actions";
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

const createFamilySchema = z.object({
  name: z.string().min(2).max(100),
});

const joinFamilySchema = z.object({
  code: z.string().min(1, "Invite code is required"),
});

type CreateValues = z.infer<typeof createFamilySchema>;
type JoinValues = z.infer<typeof joinFamilySchema>;

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const { data: session } = useSession();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [isPending, setIsPending] = useState(false);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: { name: "" },
  });

  const joinForm = useForm<JoinValues>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: { code: "" },
  });

  async function handleCreate(values: CreateValues) {
    setIsPending(true);
    try {
      const result = await createFamily(values);
      if (result.success) {
        toast.success(t("familyCreated"));
        window.location.href = `/${locale}/dashboard`;
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsPending(false);
    }
  }

  async function handleJoin(values: JoinValues) {
    if (!session?.user?.id) return;
    setIsPending(true);
    try {
      const result = await acceptInvitation(values.code.trim(), session.user.id);
      if (result.success) {
        toast.success(t("familyJoined"));
        window.location.href = `/${locale}/dashboard`;
      } else {
        toast.error(result.error ?? t("invalidCode"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsPending(false);
    }
  }

  if (mode === "choose") {
    return (
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setMode("create")}
          className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{t("createFamily")}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t("createFamilyDesc")}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("join")}
          className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 text-left transition-colors hover:border-green-300 hover:bg-green-50/50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50">
            <UserPlus className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{t("joinFamily")}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t("joinFamilyDesc")}</p>
          </div>
        </button>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("createFamily")}</CardTitle>
          <CardDescription>{t("createFamilyDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("familyName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("familyNamePlaceholder")}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("choose")}
                  disabled={isPending}
                >
                  {t("back")}
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("createFamily")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("joinFamily")}</CardTitle>
        <CardDescription>{t("joinFamilyDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...joinForm}>
          <form onSubmit={joinForm.handleSubmit(handleJoin)} className="space-y-4">
            <FormField
              control={joinForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inviteCode")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("inviteCodePlaceholder")}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={isPending}
              >
                {t("back")}
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("joinFamily")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
