import { getTranslations } from "next-intl/server";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { MemberList } from "@/components/members/member-list";
import { InviteForm } from "@/components/members/invite-form";

export default async function MembersPage() {
  const session = await requireFamilyAuth();
  const t = await getTranslations("members");
  const { familyId, familyRole } = session.user;

  const [members, invitations] = await Promise.all([
    prisma.familyMembership.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),

    prisma.familyInvitation.findMany({
      where: { familyId, status: "PENDING" },
      include: {
        inviter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const canInvite = hasPermission(familyRole, "member:invite");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {canInvite && <InviteForm />}

      <MemberList
        members={members}
        invitations={invitations}
        currentUserId={session.user.id}
        currentUserRole={familyRole}
      />
    </div>
  );
}
