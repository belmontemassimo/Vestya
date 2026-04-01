import { getTranslations } from "next-intl/server";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const session = await requireFamilyAuth();
  const t = await getTranslations("notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <NotificationList notifications={notifications} />
    </div>
  );
}
