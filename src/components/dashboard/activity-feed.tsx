"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatRelativeDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  userName?: string;
  user?: { id: string; name: string | null; image: string | null };
  action: string;
  entityType: string;
  entityId: string;
  createdAt: Date | string;
  metadata?: unknown;
}

interface ActivityFeedProps {
  activities: readonly Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            {t("noRecentActivity")}
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">
                      {activity.userName ?? activity.user?.name ?? ""}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.entityType}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRelativeDate(
                      typeof activity.createdAt === "string"
                        ? activity.createdAt
                        : activity.createdAt.toISOString(),
                      locale
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
