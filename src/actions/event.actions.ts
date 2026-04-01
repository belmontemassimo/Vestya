"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  createEventSchema,
  updateEventSchema,
} from "@/schemas/event.schema";
import { paginationSchema } from "@/schemas/common.schema";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type { Event } from "@prisma/client";

export async function createEvent(
  input: unknown,
): Promise<ActionResult<Event>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "event:create");

    const parsed = createEventSchema.parse(input);

    const event = await prisma.event.create({
      data: {
        ...parsed,
        familyId: session.user.familyId,
        createdBy: session.user.id,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "event",
      entityId: event.id,
      action: "created",
      metadata: { title: event.title },
    });

    revalidatePath("/");
    return { success: true, data: event };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateEvent(
  input: unknown,
): Promise<ActionResult<Event>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "event:update");

    const parsed = updateEventSchema.parse(input);
    const { id, ...data } = parsed;

    const event = await prisma.event.update({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
      data,
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "event",
      entityId: event.id,
      action: "updated",
      metadata: { title: event.title },
    });

    revalidatePath("/");
    return { success: true, data: event };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteEvent(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "event:delete");

    await prisma.event.update({
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
      entityType: "event",
      entityId: id,
      action: "deleted",
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getEvents(
  filters?: EventFilters,
): Promise<ActionResult<PaginatedResult<Event>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "event:read");

    const { page, limit, search } = paginationSchema.parse(filters ?? {});
    const skip = (page - 1) * limit;

    const dateFilters: Record<string, unknown> = {};
    if (filters?.startDate) {
      dateFilters.gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      dateFilters.lte = new Date(filters.endDate);
    }

    const where = {
      familyId: session.user.familyId,
      deletedAt: null,
      ...(filters?.propertyId ? { propertyId: filters.propertyId } : {}),
      ...(Object.keys(dateFilters).length > 0
        ? { startAt: dateFilters }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { location: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startAt: "asc" },
        skip,
        take: limit,
        include: {
          property: { select: { id: true, name: true } },
          linkedContact: { select: { id: true, name: true } },
          linkedTask: { select: { id: true, title: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items as Event[],
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
