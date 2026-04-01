"use client";

import type { LucideIcon } from "lucide-react";
import { GripVertical, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCENT_COLORS: Record<string, string> = {
  blue: "border-l-blue-500",
  indigo: "border-l-indigo-500",
  purple: "border-l-purple-500",
  green: "border-l-green-500",
  amber: "border-l-amber-500",
  slate: "border-l-slate-500",
  orange: "border-l-orange-500",
  pink: "border-l-pink-500",
};

interface WidgetContainerProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  isEditing: boolean;
  onRemove?: () => void;
  accentColor?: string;
  children: React.ReactNode;
}

export function WidgetContainer({
  title,
  icon: Icon,
  href,
  isEditing,
  onRemove,
  accentColor,
  children,
}: WidgetContainerProps) {
  const accentClass = accentColor ? ACCENT_COLORS[accentColor] ?? "" : "";
  const card = (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden",
        accentClass && `border-l-[3px] ${accentClass}`,
        href && !isEditing && "hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex h-11 items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4">
        {isEditing && (
          <GripVertical className="widget-drag-handle h-4 w-4 shrink-0 cursor-grab text-slate-400" />
        )}
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate text-sm font-medium text-slate-700">
          {title}
        </span>
        {isEditing && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
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
      <div className="relative flex-1 overflow-hidden p-4">
        {children}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>
    </Card>
  );

  if (href && !isEditing) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
