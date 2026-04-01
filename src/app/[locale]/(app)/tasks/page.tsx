import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";
import type { TaskStatus, TaskPriority, Prisma } from "@prisma/client";

interface TasksPageProps {
  searchParams: {
    status?: string;
    priority?: string;
    propertyId?: string;
    search?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const where: Prisma.TaskWhereInput = {
    familyId,
    deletedAt: null,
  };

  if (searchParams.status) {
    where.status = searchParams.status as TaskStatus;
  }

  if (searchParams.priority) {
    where.priority = searchParams.priority as TaskPriority;
  }

  if (searchParams.propertyId) {
    where.propertyId = searchParams.propertyId;
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [tasks, properties, memberships] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, image: true } },
        contactAssignee: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),

    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    prisma.familyMembership.findMany({
      where: { familyId, status: "ACTIVE" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const members = memberships.map((m) => ({
    value: m.user.id,
    label: m.user.name ?? m.user.id,
  }));

  return (
    <TasksPageClient
      tasks={tasks}
      properties={properties}
      members={members}
      currentFilters={{
        status: searchParams.status,
        priority: searchParams.priority,
        propertyId: searchParams.propertyId,
        search: searchParams.search,
      }}
    />
  );
}
