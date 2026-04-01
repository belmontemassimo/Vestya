"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  getUploadUrl,
  getDownloadUrl,
  deleteFile,
  generateStorageKey,
} from "@/lib/storage";
import { uploadDocumentSchema } from "@/schemas/document.schema";
import { paginationSchema } from "@/schemas/common.schema";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type { Document, VisibilityLevel } from "@prisma/client";

interface DocumentWithUploadUrl {
  uploadUrl: string;
  document: Document;
}

export async function createDocumentRecord(
  input: unknown,
): Promise<ActionResult<DocumentWithUploadUrl>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "document:upload");

    const parsed = uploadDocumentSchema.parse(input);

    const storageKey = generateStorageKey(
      session.user.familyId,
      parsed.fileName,
    );

    const uploadUrl = await getUploadUrl(storageKey, parsed.mimeType);

    const document = await prisma.document.create({
      data: {
        familyId: session.user.familyId,
        uploadedBy: session.user.id,
        fileName: parsed.fileName,
        storageKey,
        mimeType: parsed.mimeType,
        sizeBytes: parsed.sizeBytes,
        propertyId: parsed.propertyId,
        notes: parsed.notes,
        tags: parsed.tags,
        visibilityLevel: parsed.visibilityLevel,
        expiryDate: parsed.expiryDate,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "document",
      entityId: document.id,
      action: "uploaded",
      metadata: { fileName: document.fileName },
    });

    revalidatePath("/");
    return { success: true, data: { uploadUrl, document } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteDocument(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "document:delete");

    const document = await prisma.document.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!document) {
      return { success: false, error: "Document not found." };
    }

    try {
      await deleteFile(document.storageKey);
    } catch (storageError) {
      console.error(
        "[Document] Failed to delete file from storage:",
        storageError,
      );
    }

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "document",
      entityId: id,
      action: "deleted",
      metadata: { fileName: document.fileName },
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

interface DocumentFilters {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  visibilityLevel?: VisibilityLevel;
}

export async function getDocuments(
  filters?: DocumentFilters,
): Promise<ActionResult<PaginatedResult<Document>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "document:read");

    const { page, limit, search } = paginationSchema.parse(filters ?? {});
    const skip = (page - 1) * limit;

    const where = {
      familyId: session.user.familyId,
      deletedAt: null,
      ...(filters?.propertyId ? { propertyId: filters.propertyId } : {}),
      ...(filters?.visibilityLevel
        ? { visibilityLevel: filters.visibilityLevel }
        : {}),
      ...(search
        ? {
            OR: [
              { fileName: { contains: search, mode: "insensitive" as const } },
              { notes: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          property: { select: { id: true, name: true } },
          uploader: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items as Document[],
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

export async function getDocumentDownloadUrl(
  id: string,
): Promise<ActionResult<{ downloadUrl: string }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "document:read");

    const document = await prisma.document.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!document) {
      return { success: false, error: "Document not found." };
    }

    const downloadUrl = await getDownloadUrl(document.storageKey);

    return { success: true, data: { downloadUrl } };
  } catch (error) {
    return handleActionError(error);
  }
}
