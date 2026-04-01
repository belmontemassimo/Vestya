"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  createTaskSchema,
  updateTaskSchema,
} from "@/schemas/task.schema";
import { paginationSchema } from "@/schemas/common.schema";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type { Task, TaskComment, TaskStatus, TaskPriority } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

function serializeTask(task: Task): Task {
  return {
    ...task,
    estimatedCost: task.estimatedCost
      ? (Number(task.estimatedCost) as unknown as Decimal)
      : null,
    actualCost: task.actualCost
      ? (Number(task.actualCost) as unknown as Decimal)
      : null,
  };
}

export async function createTask(
  input: unknown,
): Promise<ActionResult<Task>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "task:create");

    const parsed = createTaskSchema.parse(input);

    const task = await prisma.task.create({
      data: {
        ...parsed,
        familyId: session.user.familyId,
        createdBy: session.user.id,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "task",
      entityId: task.id,
      action: "created",
      metadata: { title: task.title },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTask(
  input: unknown,
): Promise<ActionResult<Task>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "task:update");

    const parsed = updateTaskSchema.parse(input);
    const { id, ...data } = parsed;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found." };
    }

    const updateData: Record<string, unknown> = { ...data };

    if (data.status === "DONE" && existingTask.status !== "DONE") {
      updateData.completedAt = new Date();
    }

    if (data.status !== "DONE" && existingTask.status === "DONE") {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "task",
      entityId: task.id,
      action: "updated",
      metadata: {
        title: task.title,
        ...(data.status !== existingTask.status
          ? { statusChange: { from: existingTask.status, to: data.status } }
          : {}),
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTask(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "task:delete");

    await prisma.task.update({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "task",
      entityId: id,
      action: "deleted",
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  propertyId?: string;
}

export async function getTasks(
  filters?: TaskFilters,
): Promise<ActionResult<PaginatedResult<Task>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "task:read");

    const { page, limit, search } = paginationSchema.parse(filters ?? {});
    const skip = (page - 1) * limit;

    const where = {
      familyId: session.user.familyId,
      deletedAt: null,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.priority ? { priority: filters.priority } : {}),
      ...(filters?.propertyId ? { propertyId: filters.propertyId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          property: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
          contactAssignee: { select: { id: true, name: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map(serializeTask) as Task[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addTaskComment(
  taskId: string,
  content: string,
): Promise<ActionResult<TaskComment>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "task:update");

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Comment content is required." };
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: session.user.id,
        content: content.trim(),
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "task_comment",
      entityId: comment.id,
      action: "created",
      metadata: { taskId, taskTitle: task.title },
    });

    revalidatePath("/");
    return { success: true, data: comment };
  } catch (error) {
    return handleActionError(error);
  }
}
