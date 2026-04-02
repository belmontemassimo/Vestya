"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  createContactSchema,
  updateContactSchema,
} from "@/schemas/contact.schema";
import { paginationSchema } from "@/schemas/common.schema";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type { Contact, ContactCategory } from "@prisma/client";

export async function createContact(
  input: unknown,
): Promise<ActionResult<Contact>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "contact:create");

    const parsed = createContactSchema.parse(input);

    const contact = await prisma.contact.create({
      data: {
        ...parsed,
        familyId: session.user.familyId,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "contact",
      entityId: contact.id,
      action: "created",
      metadata: { name: contact.name },
    });

    revalidatePath("/");
    return { success: true, data: contact };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function linkContactToProperty(
  contactId: string,
  propertyId: string,
  relationshipType = "GENERAL",
): Promise<ActionResult<{ linked: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "contact:create");

    await prisma.propertyContact.upsert({
      where: {
        propertyId_contactId_relationshipType: {
          propertyId,
          contactId,
          relationshipType,
        },
      },
      create: { propertyId, contactId, relationshipType },
      update: {},
    });

    revalidatePath("/");
    return { success: true, data: { linked: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateContact(
  input: unknown,
): Promise<ActionResult<Contact>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "contact:update");

    const parsed = updateContactSchema.parse(input);
    const { id, ...data } = parsed;

    const contact = await prisma.contact.update({
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
      entityType: "contact",
      entityId: contact.id,
      action: "updated",
      metadata: { name: contact.name },
    });

    revalidatePath("/");
    return { success: true, data: contact };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteContact(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "contact:delete");

    await prisma.contact.update({
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
      entityType: "contact",
      entityId: id,
      action: "deleted",
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

interface ContactFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: ContactCategory;
}

export async function getContacts(
  filters?: ContactFilters,
): Promise<ActionResult<PaginatedResult<Contact>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "contact:read");

    const { page, limit, search } = paginationSchema.parse(filters ?? {});
    const skip = (page - 1) * limit;

    const where = {
      familyId: session.user.familyId,
      deletedAt: null,
      ...(filters?.category ? { category: filters.category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { company: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
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
