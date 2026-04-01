"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/schemas/property.schema";
import { paginationSchema } from "@/schemas/common.schema";
import { geocodeAddress } from "@/lib/geocode";
import { getUploadUrl, generateStorageKey } from "@/lib/storage";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type { Property } from "@prisma/client";

export async function createProperty(
  input: unknown,
): Promise<ActionResult<Property>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:create");

    const parsed = createPropertySchema.parse(input);

    const property = await prisma.property.create({
      data: {
        ...parsed,
        familyId: session.user.familyId,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "property",
      entityId: property.id,
      action: "created",
      metadata: { name: property.name },
    });

    // Geocode in the background — don't block the response
    geocodeAddress(parsed).then(async (coords) => {
      if (coords) {
        await prisma.property.update({
          where: { id: property.id },
          data: { latitude: coords.latitude, longitude: coords.longitude },
        }).catch(() => {});
      }
    }).catch(() => {});

    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(property)) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProperty(
  input: unknown,
): Promise<ActionResult<Property>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const parsed = updatePropertySchema.parse(input);
    const { id, ...data } = parsed;

    const property = await prisma.property.update({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
      data,
    });

    // Re-geocode in the background if address changed
    const hasAddressChange =
      data.addressLine1 !== undefined ||
      data.city !== undefined ||
      data.region !== undefined ||
      data.postalCode !== undefined ||
      data.country !== undefined;

    if (hasAddressChange) {
      const merged = { ...property, ...data };
      geocodeAddress(merged).then(async (coords) => {
        if (coords) {
          await prisma.property.update({
            where: { id },
            data: { latitude: coords.latitude, longitude: coords.longitude },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "property",
      entityId: property.id,
      action: "updated",
      metadata: { name: property.name },
    });

    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(property)) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProperty(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:delete");

    await prisma.property.update({
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
      entityType: "property",
      entityId: id,
      action: "deleted",
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProperties(
  filters?: unknown,
): Promise<ActionResult<PaginatedResult<Property>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:read");

    const { page, limit, search } = paginationSchema.parse(filters ?? {});
    const skip = (page - 1) * limit;

    const where = {
      familyId: session.user.familyId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { city: { contains: search, mode: "insensitive" as const } },
              { addressLine1: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items,
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

export async function getPropertyCoverUploadUrl(
  propertyId: string,
  mimeType: string,
): Promise<ActionResult<{ uploadUrl: string; storageKey: string }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const property = await prisma.property.findFirst({
      where: { id: propertyId, familyId: session.user.familyId, deletedAt: null },
    });
    if (!property) {
      return { success: false, error: "Property not found." };
    }

    const storageKey = generateStorageKey(
      session.user.familyId,
      `cover-${propertyId}.${mimeType.split("/")[1] ?? "jpg"}`,
    );
    const uploadUrl = await getUploadUrl(storageKey, mimeType);

    return { success: true, data: { uploadUrl, storageKey } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setPropertyCoverImage(
  propertyId: string,
  imageUrl: string,
): Promise<ActionResult<Property>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "property:update");

    const property = await prisma.property.update({
      where: {
        id: propertyId,
        familyId: session.user.familyId,
        deletedAt: null,
      },
      data: {
        images: [imageUrl],
      },
    });

    revalidatePath("/");
    return { success: true, data: property };
  } catch (error) {
    return handleActionError(error);
  }
}
