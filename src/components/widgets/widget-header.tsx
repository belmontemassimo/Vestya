"use client";

import { Plus } from "lucide-react";

interface WidgetHeaderProps {
  title: string;
  onAdd?: (e: React.MouseEvent) => void;
  addLabel?: string;
}

export function WidgetHeader({ title, onAdd, addLabel }: WidgetHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {onAdd && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd(e);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
