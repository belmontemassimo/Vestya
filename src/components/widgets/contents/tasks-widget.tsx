"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { formatDateShort } from "@/lib/utils";
import { toggleTaskDone, createTask } from "@/actions/task.actions";
import { cn } from "@/lib/utils";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { TaskForm } from "@/components/tasks/task-form";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  property?: { name: string } | null;
}

interface TasksWidgetProps {
  tasks: TaskItem[];
  propertyId?: string;
}

export function TasksWidget({ tasks: initialTasks, propertyId }: TasksWidgetProps) {
  const t = useTranslations("tasks");
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleTaskClick(e: React.MouseEvent, taskId: string) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/tasks/${taskId}` as never);
  }

  async function handleToggleDone(e: React.MouseEvent, task: TaskItem) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleTaskDone(task.id);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: task.status === "DONE" ? "TODO" : "DONE" }
            : t,
        ),
      );
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  async function handleCreate(values: Record<string, unknown>) {
    const payload = propertyId ? { ...values, propertyId } : values;
    const result = await createTask(payload);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <WidgetHeader title={t("title")} onAdd={() => setDialogOpen(true)} addLabel={t("addTask")} />
        {tasks.length === 0 ? (
          <p className="text-xs italic text-slate-400">{t("noTasks")}</p>
        ) : (
          <div className="space-y-1.5 overflow-y-auto">
            {tasks.slice(0, 8).map((task) => {
              const isDone = task.status === "DONE";
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={(e) => handleTaskClick(e, task.id)}
                  className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-xs font-medium", isDone ? "text-slate-400 line-through" : "text-slate-700")}>{task.title}</p>
                    {task.dueAt && <p className="text-[10px] text-slate-400">{formatDateShort(task.dueAt)}</p>}
                  </div>
                  <TaskPriorityBadge priority={task.priority} />
                  <div
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={(e) => handleToggleDone(e, task)}
                    className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors", isDone ? "border-green-500 bg-green-500" : "border-slate-300 hover:border-slate-400")}
                  >
                    {isDone && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addTask")}>
        <TaskForm properties={[]} members={[]} showPropertyField={!propertyId} onSubmit={handleCreate} defaultValues={propertyId ? { propertyId } : undefined} />
      </FormDialog>
    </>
  );
}
