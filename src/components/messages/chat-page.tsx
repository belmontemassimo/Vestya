"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2, MessageSquare } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { format, isSameDay } from "date-fns";

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">
        {format(new Date(date), "MMMM d, yyyy")}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function ChatPage() {
  const { data: session } = useSession();
  const { messages, isLoading, sendMessage, isSending } = useMessages();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentUserId = session?.user?.id;

  // Messages come newest-first from the API; reverse for display
  const orderedMessages = [...messages].reverse();

  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : orderedMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
            <MessageSquare className="h-10 w-10" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orderedMessages.map((message, index) => {
              const messageDate = new Date(
                typeof message.createdAt === "string"
                  ? message.createdAt
                  : message.createdAt
              );
              const prevMessage = index > 0 ? orderedMessages[index - 1] : null;
              const prevDate = prevMessage
                ? new Date(
                    typeof prevMessage.createdAt === "string"
                      ? prevMessage.createdAt
                      : prevMessage.createdAt
                  )
                : null;

              const showDateSeparator =
                !prevDate || !isSameDay(messageDate, prevDate);

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <DateSeparator date={messageDate.toISOString()} />
                  )}
                  <MessageBubble
                    content={message.content}
                    userName={message.user.name ?? "Unknown"}
                    userImage={message.user.image}
                    createdAt={
                      typeof message.createdAt === "string"
                        ? message.createdAt
                        : new Date(message.createdAt).toISOString()
                    }
                    isOwn={message.user.id === currentUserId}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} isSending={isSending} />
    </div>
  );
}
