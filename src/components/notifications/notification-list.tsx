"use client";

import { useTranslations, useLocale } from "next-intl";
import { Bell } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date | string;
  readAt?: string | null;
  read?: boolean;
  link: string | null;
}

interface NotificationListProps {
  notifications: readonly Notification[];
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (link: string) => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onNavigate,
}: NotificationListProps) {
  const t = useTranslations("notifications");
  const locale = useLocale();

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const isUnread =
          notification.readAt !== undefined
            ? !notification.readAt
            : notification.read !== undefined
            ? !notification.read
            : false;

        return (
          <button
            key={notification.id}
            type="button"
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-colors",
              isUnread
                ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            )}
            onClick={() => {
              if (isUnread && onMarkAsRead) {
                onMarkAsRead(notification.id);
              }
              if (notification.link && onNavigate) {
                onNavigate(notification.link);
              }
            }}
          >
            <div className="flex items-start gap-3">
              {isUnread && (
                <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm",
                    isUnread
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-700"
                  )}
                >
                  {notification.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatRelativeDate(
                    typeof notification.createdAt === "string"
                      ? notification.createdAt
                      : notification.createdAt.toISOString(),
                    locale
                  )}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
