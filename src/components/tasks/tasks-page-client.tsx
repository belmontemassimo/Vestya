"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { createTask } from "@/actions/task.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter, usePathname } from "@/i18n/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface TasksPageClientProps {
  tasks: Parameters<typeof TaskList>[0]["tasks"];
  properties: Parameters<typeof TaskList>[0]["properties"];
  members: readonly SelectOption[];
  contacts?: readonly SelectOption[];
  currentFilters: Parameters<typeof TaskList>[0]["currentFilters"];
}

export function TasksPageClient({
  tasks,
  properties,
  members,
  contacts = [],
  currentFilters,
}: TasksPageClientProps) {
  const t = useTranslations("tasks");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const propertyOptions: readonly SelectOption[] = (properties ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}` as never);
    },
    [searchParams, pathname, router],
  );

  async function handleSubmit(values: Record<string, unknown>) {
    const result = await createTask(values);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addTask")}
        </button>
      </PageHeader>

      <TaskList
        tasks={tasks}
        properties={properties}
        currentFilters={currentFilters}
        onStatusChange={(v) => updateFilter("status", v)}
        onPriorityChange={(v) => updateFilter("priority", v)}
        onPropertyChange={(v) => updateFilter("propertyId", v)}
        onAdd={() => setDialogOpen(true)}
      />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addTask")}>
        <TaskForm
          properties={propertyOptions}
          members={members}
          contacts={contacts}
          onSubmit={handleSubmit}
        />
      </FormDialog>
    </div>
  );
}
