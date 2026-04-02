"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  taskName,
  onConfirm,
}: DeleteTaskDialogProps) {
  const t = useTranslations("tasks");
  const [confirmation, setConfirmation] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isValid = confirmation === "DELETE";

  async function handleConfirm() {
    if (!isValid) return;
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setConfirmation("");
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              {t("deleteWarning", { name: taskName })}
            </span>
            <span className="block text-sm font-medium text-slate-700">
              {t("deleteConfirmPrompt")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          autoFocus
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("deleteTask")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
