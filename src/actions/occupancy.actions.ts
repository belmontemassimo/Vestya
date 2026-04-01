"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import { OccupancyType } from "@prisma/client";
import type { ActionResult } from "@/types/api";
import type { OccupancyRecord } from "@prisma/client";

const createOccupancySchema = z.object({
  type: z.nativeEnum(OccupancyType),
  propertyId: z.string().min(1, "Property is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  linkedContactId: z.string().optional(),
});

const updateOccupancySchema = z.object({
  id: z.string(),
  type: z.nativeEnum(OccupancyType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  linkedContactId: z.string().optional(),
});

export async function createOccupancy(
  input: unknown,
): Promise<ActionResult<OccupancyRecord>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const parsed = createOccupancySchema.parse(input);

    const property = await prisma.property.findFirst({
      where: {
        id: parsed.propertyId,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    const record = await prisma.occupancyRecord.create({
      data: {
        ...parsed,
        familyId: session.user.familyId,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "occupancy",
      entityId: record.id,
      action: "created",
      metadata: {
        type: record.type,
        propertyId: record.propertyId,
      },
    });

    revalidatePath("/");
    return { success: true, data: record };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateOccupancy(
  input: unknown,
): Promise<ActionResult<OccupancyRecord>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const parsed = updateOccupancySchema.parse(input);
    const { id, ...data } = parsed;

    const existing = await prisma.occupancyRecord.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
      },
    });

    if (!existing) {
      return { success: false, error: "Occupancy record not found." };
    }

    const record = await prisma.occupancyRecord.update({
      where: { id },
      data,
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "occupancy",
      entityId: record.id,
      action: "updated",
      metadata: { type: record.type },
    });

    revalidatePath("/");
    return { success: true, data: record };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteOccupancy(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const existing = await prisma.occupancyRecord.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
      },
    });

    if (!existing) {
      return { success: false, error: "Occupancy record not found." };
    }

    await prisma.occupancyRecord.delete({
      where: { id },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "occupancy",
      entityId: id,
      action: "deleted",
      metadata: { propertyId: existing.propertyId },
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getOccupancies(
  propertyId: string,
): Promise<ActionResult<OccupancyRecord[]>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:read");

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    const records = await prisma.occupancyRecord.findMany({
      where: {
        propertyId,
        familyId: session.user.familyId,
      },
      orderBy: { startDate: "desc" },
      include: {
        linkedContact: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: records as OccupancyRecord[] };
  } catch (error) {
    return handleActionError(error);
  }
}
