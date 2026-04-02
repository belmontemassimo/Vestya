"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { createTask, updateTask, deleteTask } from "@/actions/task.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SelectOption {
  value: string;
  label: string;
}

interface PropertyOption {
  id: string;
  name: string;
}

interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  category?: string;
  propertyId?: string | null;
  property?: { id: string; name: string } | null;
  dueAt: Date | string | null;
  assignee?: { id: string; name: string | null; image: string | null } | null;
  contactAssignee?: { id: string; name: string } | null;
  assignedTo?: string | null;
  assignedContact?: string | null;
}

interface TasksPageClientProps {
  tasks: readonly TaskData[];
  properties: readonly PropertyOption[];
  members: readonly SelectOption[];
  contacts?: readonly SelectOption[];
  currentFilters: {
    status?: string;
    priority?: string;
    propertyId?: string;
    search?: string;
  };
}

export function TasksPageClient({
  tasks,
  properties,
  members,
  contacts = [],
  currentFilters,
}: TasksPageClientProps) {
  const t = useTranslations("tasks");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskData | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const propertyOptions: readonly SelectOption[] = properties.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  // Filter tasks by active tab
  const filteredTasks = useMemo(() => {
    if (activeTab === "all") return tasks;
    if (activeTab === "general") {
      return tasks.filter((t) => !t.propertyId && !t.property);
    }
    return tasks.filter(
      (t) => t.propertyId === activeTab || t.property?.id === activeTab
    );
  }, [tasks, activeTab]);

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

  async function handleCreate(values: Record<string, unknown>) {
    const payload =
      activeTab !== "all" && activeTab !== "general"
        ? { ...values, propertyId: activeTab }
        : values;
    const result = await createTask(payload);
    if (result.success) {
      setCreateDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  async function handleEdit(values: Record<string, unknown>) {
    if (!editingTask) return { success: false, error: "No task" };
    const result = await updateTask({
      id: editingTask.id,
      status: editingTask.status,
      ...values,
    });
    if (result.success) {
      setEditingTask(null);
      router.refresh();
    }
    return result;
  }

  async function handleDelete() {
    if (!deletingTask) return;
    const result = await deleteTask(deletingTask.id);
    if (result.success) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  function openEdit(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (task) setEditingTask(task);
  }

  function openDelete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (task) setDeletingTask(task);
  }

  const activePropertyId =
    activeTab !== "all" && activeTab !== "general" ? activeTab : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addTask")}
        </button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("tabAll")}</TabsTrigger>
          <TabsTrigger value="general">{t("tabGeneral")}</TabsTrigger>
          {properties.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <TaskList
            tasks={filteredTasks}
            currentFilters={{
              status: currentFilters.status,
              priority: currentFilters.priority,
            }}
            onStatusChange={(v) => updateFilter("status", v)}
            onPriorityChange={(v) => updateFilter("priority", v)}
            onAdd={() => setCreateDialogOpen(true)}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={t("addTask")}
      >
        <TaskForm
          properties={propertyOptions}
          members={members}
          contacts={contacts}
          showPropertyField={!activePropertyId}
          defaultValues={activePropertyId ? { propertyId: activePropertyId } : undefined}
          onSubmit={handleCreate}
        />
      </FormDialog>

      {/* Edit dialog */}
      <FormDialog
        open={!!editingTask}
        onOpenChange={(open) => { if (!open) setEditingTask(null); }}
        title={t("editTask")}
      >
        {editingTask && (
          <TaskForm
            isEditing
            properties={propertyOptions}
            members={members}
            contacts={contacts}
            defaultValues={{
              title: editingTask.title,
              description: editingTask.description ?? "",
              category: (editingTask.category as "OTHER") ?? "OTHER",
              priority: (editingTask.priority as "MEDIUM") ?? "MEDIUM",
              propertyId: editingTask.propertyId ?? editingTask.property?.id ?? "",
              assignedTo: editingTask.assignedTo ?? editingTask.assignee?.id ?? "",
              assignedContact: editingTask.assignedContact ?? editingTask.contactAssignee?.id ?? "",
              dueAt: editingTask.dueAt
                ? typeof editingTask.dueAt === "string"
                  ? editingTask.dueAt.slice(0, 16)
                  : editingTask.dueAt.toISOString().slice(0, 16)
                : "",
            }}
            onSubmit={handleEdit}
          />
        )}
      </FormDialog>

      {/* Delete dialog */}
      <DeleteTaskDialog
        open={!!deletingTask}
        onOpenChange={(open) => { if (!open) setDeletingTask(null); }}
        taskName={deletingTask?.title ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
