"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-slate-200 bg-white shadow-lg text-sm",
          title: "font-semibold text-slate-900",
          description: "text-slate-500",
          actionButton: "bg-slate-900 text-white",
          cancelButton: "bg-slate-100 text-slate-600",
        },
      }}
    />
  );
}
