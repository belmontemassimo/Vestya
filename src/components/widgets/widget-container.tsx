"use client";

import { useCallback } from "react";
import { GripVertical, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WidgetContainerProps {
  href?: string;
  isEditing: boolean;
  onRemove?: () => void;
  /** When true, removes inner padding so content fills edge-to-edge. */
  bleed?: boolean;
  children: React.ReactNode;
}

export function WidgetContainer({
  href,
  isEditing,
  onRemove,
  bleed = false,
  children,
}: WidgetContainerProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only navigate if the click target is NOT inside an interactive element
      // (button, a, dialog) that already handled the event
      if (!href || isEditing) return;

      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='dialog']")) return;

      router.push(href as never);
    },
    [href, isEditing, router],
  );

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-xl bg-white",
        "transition-all duration-200 ease-out",
        !bleed && "p-4",
        isEditing
          ? "ring-1 ring-slate-200"
          : "shadow-sm hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)]",
        href && !isEditing && "cursor-pointer",
      )}
      onClick={handleClick}
    >
      {isEditing && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          <GripVertical className="widget-drag-handle h-4 w-4 cursor-grab text-slate-300 hover:text-slate-500" />
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-300 hover:bg-red-50 hover:text-red-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}
