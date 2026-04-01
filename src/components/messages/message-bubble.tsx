"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
  isOwn: boolean;
}

export function MessageBubble({
  content,
  userName,
  userImage,
  createdAt,
  isOwn,
}: MessageBubbleProps) {
  return (
    <div
      className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {userImage && <AvatarImage src={userImage} alt={userName} />}
        <AvatarFallback className="text-xs">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && (
          <span className="mb-1 text-xs font-medium text-slate-500">
            {userName}
          </span>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isOwn
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-900"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>

        <span
          className={cn(
            "mt-1 text-xs",
            isOwn ? "text-blue-200" : "text-slate-400"
          )}
        >
          {formatRelativeDate(createdAt)}
        </span>
      </div>
    </div>
  );
}
