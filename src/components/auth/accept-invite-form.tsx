"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const registrationSchema = z
  .object({
    name: z.string().min(2),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegistrationValues = z.infer<typeof registrationSchema>;

interface InviteDetails {
  familyName: string;
  email: string;
  role: string;
  token: string;
}

interface AcceptInviteFormProps {
  invite?: InviteDetails;
  token?: string;
  email?: string;
  familyName?: string;
  role?: string;
}

export function AcceptInviteForm({
  invite: inviteProp,
  token,
  email,
  familyName,
  role,
}: AcceptInviteFormProps) {
  const invite: InviteDetails = inviteProp ?? {
    token: token ?? "",
    email: email ?? "",
    familyName: familyName ?? "",
    role: role ?? "",
  };
  const t = useTranslations("auth");
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const isLoggedIn = !!session?.user;

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  async function handleAccept(registrationData?: RegistrationValues) {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invite.token,
          ...(registrationData && {
            name: registrationData.name,
            password: registrationData.password,
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? t("unexpectedError"));
        return;
      }

      setAccepted(true);
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setIsPending(false);
    }
  }

  if (accepted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            {t("inviteAccepted")}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {t("inviteAcceptedDescription", { family: invite.familyName })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("joinFamily")}</CardTitle>
        <CardDescription>
          {t("invitedToJoin", { family: invite.familyName, role: invite.role })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-3 mb-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium">{t("email")}:</span> {invite.email}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">{t("role")}:</span> {invite.role}
          </p>
        </div>

        {isLoggedIn ? (
          <Button
            className="w-full"
            onClick={() => handleAccept()}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("acceptInvitation")}
          </Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => handleAccept(values))}
              className="space-y-4"
            >
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("acceptInvitation")}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
