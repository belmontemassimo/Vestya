"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { formatRelativeDate } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationRead,
} from "@/actions/notification.actions";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link: string | null;
}

interface NotificationsData {
  items: NotificationItem[];
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotificationsData> {
  const result = await getNotifications();
  if (!result.success) {
    return { items: [], unreadCount: 0 };
  }
  const notifications = result.data ?? [];
  const items: NotificationItem[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt:
      typeof n.createdAt === "string"
        ? n.createdAt
        : new Date(n.createdAt).toISOString(),
    read: n.read,
    link: n.link,
  }));
  const unreadCount = items.filter((n) => !n.read).length;
  return { items: items.slice(0, 10), unreadCount };
}

async function markAsRead(id: string): Promise<void> {
  await markNotificationRead(id);
}

export function NotificationBell() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.items ?? [];

  function handleClick(notification: NotificationItem) {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold">{t("title")}</p>
          {unreadCount > 0 && (
            <span className="text-xs text-blue-600">
              {t("unreadCount", { count: unreadCount })}
            </span>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">{t("noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const isUnread = !notification.read;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors hover:bg-slate-50",
                      isUnread && "bg-blue-50/50"
                    )}
                    onClick={() => handleClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      {isUnread && (
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatRelativeDate(notification.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-slate-100 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push("/notifications")}
          >
            {t("viewAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
