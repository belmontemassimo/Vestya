"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessagesWidgetProps {
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    userId?: string;
    user: { name: string | null; image: string | null };
  }>;
}

export function MessagesWidget({ messages }: MessagesWidgetProps) {
  const t = useTranslations("messages");
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Show newest at bottom (reverse the desc-ordered list)
  const displayed = messages.slice(0, 6).reverse();

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        {t("title")}
      </h3>

      {messages.length === 0 ? (
        <p className="text-xs italic text-slate-400">{t("noMessages")}</p>
      ) : (
        <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto">
          {displayed.map((message) => {
            const name = message.user.name ?? "?";
            const isOwn = message.userId === currentUserId;

            return (
              <div
                key={message.id}
                className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
              >
                {!isOwn && (
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[9px]">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex max-w-[80%] flex-col", isOwn ? "items-end" : "items-start")}>
                  {!isOwn && (
                    <span className="mb-0.5 text-[10px] font-medium text-slate-400">
                      {name}
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-1.5",
                      isOwn ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800",
                    )}
                  >
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span className="mt-0.5 text-[9px] text-slate-300">
                    {formatRelativeDate(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
