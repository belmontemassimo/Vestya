"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ContactOption {
  id: string;
  name: string;
  category: string;
}

interface LinkContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: readonly ContactOption[];
  onConfirm: (contactIds: string[]) => Promise<void>;
}

export function LinkContactDialog({
  open,
  onOpenChange,
  contacts,
  onConfirm,
}: LinkContactDialogProps) {
  const t = useTranslations("contacts");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);

  const filtered = contacts.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleConfirm() {
    if (selected.length === 0) return;
    setIsPending(true);
    try {
      await onConfirm(selected);
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelected([]);
      setSearch("");
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("linkExisting")}</DialogTitle>
          <DialogDescription>{t("linkExistingDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchContacts")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto overscroll-contain space-y-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">{t("noContactsToLink")}</p>
          ) : (
            filtered.map((c) => {
              const isSelected = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-100"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className="text-xs text-slate-400">{t(`category.${c.category}`)}</span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0 || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("linkSelected", { count: selected.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
