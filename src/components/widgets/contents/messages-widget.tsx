"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatRelativeDate } from "@/lib/utils";

interface MessagesWidgetProps {
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }>;
}

export function MessagesWidget({ messages }: MessagesWidgetProps) {
  const t = useTranslations("messages");

  if (messages.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noMessages")}
      </p>
    );
  }

  const displayed = messages.slice(0, 5);

  return (
    <div className="space-y-3">
      {displayed.map((message) => {
        const name = message.user.name ?? "?";
        return (
          <div key={message.id} className="flex items-start gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-slate-700">
                  {name}
                </span>
                <span className="text-[10px] text-slate-300">
                  {formatRelativeDate(message.createdAt)}
                </span>
              </div>
              <p className="truncate text-sm text-slate-500">
                {message.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
