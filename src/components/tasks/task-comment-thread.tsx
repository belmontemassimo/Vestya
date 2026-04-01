"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Send } from "lucide-react";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addTaskComment } from "@/actions/task.actions";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface TaskCommentThreadProps {
  taskId: string;
  comments: Comment[];
  currentUserId: string;
}

export function TaskCommentThread({
  taskId,
  comments: initialComments,
  currentUserId,
}: TaskCommentThreadProps) {
  const t = useTranslations("tasks");
  const locale = useLocale();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsPending(true);
    try {
      const result = await addTaskComment(taskId, trimmed);
      if (result.success) {
        setComments((prev) => [
          ...prev,
          {
            ...result.data,
            user: {
              id: currentUserId,
              name: null,
              image: null,
            },
          },
        ]);
        setContent("");
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("comments")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            {t("noComments")}
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isOwn = comment.user.id === currentUserId;
              const name = comment.user.name ?? t("unknownUser");
              const createdAt =
                typeof comment.createdAt === "string"
                  ? comment.createdAt
                  : comment.createdAt.toISOString();
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex items-start gap-3",
                    isOwn && "flex-row-reverse",
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={comment.user.image ?? undefined}
                      alt={name}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-xl px-4 py-2.5",
                      isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        isOwn ? "text-blue-200" : "text-slate-400",
                      )}
                    >
                      {formatRelativeDate(createdAt, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("addComment")}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
