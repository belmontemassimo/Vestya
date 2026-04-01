import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

interface AcceptInvitePageProps {
  searchParams: { token?: string };
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const t = await getTranslations("auth");
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("acceptInviteTitle")}
        </h1>
        <p className="text-sm text-destructive">Invalid invitation link.</p>
      </div>
    );
  }

  const invitation = await prisma.familyInvitation.findUnique({
    where: { token },
    include: {
      family: { select: { id: true, name: true } },
    },
  });

  if (!invitation) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("acceptInviteTitle")}
        </h1>
        <p className="text-sm text-destructive">Invalid invitation link.</p>
      </div>
    );
  }

  const isExpired =
    invitation.status !== "PENDING" || invitation.expiresAt < new Date();

  if (isExpired) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("acceptInviteTitle")}
        </h1>
        <p className="text-sm text-destructive">{t("inviteExpired")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("acceptInviteTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("acceptInviteSubtitle", { familyName: invitation.family.name })}
        </p>
      </div>

      <AcceptInviteForm
        token={token}
        email={invitation.email}
        familyName={invitation.family.name}
        role={invitation.role}
      />
    </div>
  );
}
