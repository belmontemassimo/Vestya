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
  generateStorageKey,
} from "@/lib/storage";
import {
  createSpendingSchema,
  updateSpendingSchema,
} from "@/schemas/spending.schema";
import type { ActionResult } from "@/types/api";
import type { FinancialRecord, Document } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

function serializeFinancialRecord(
  record: FinancialRecord,
): FinancialRecord {
  return {
    ...record,
    amount: Number(record.amount) as unknown as Decimal,
  };
}

export async function createSpendingRecord(
  input: unknown,
): Promise<ActionResult<FinancialRecord>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:create");

    const parsed = createSpendingSchema.parse(input);

    const record = await prisma.financialRecord.create({
      data: {
        name: parsed.name,
        amount: parsed.amount,
        recordType: parsed.recordType,
        date: parsed.date,
        propertyId: parsed.propertyId,
        tags: parsed.tags,
        notes: parsed.notes,
        familyId: session.user.familyId,
        createdBy: session.user.id,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "financial_record",
      entityId: record.id,
      action: "created",
      metadata: {
        name: record.name,
        amount: Number(record.amount),
        recordType: record.recordType,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeFinancialRecord(record) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateSpendingRecord(
  input: unknown,
): Promise<ActionResult<FinancialRecord>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:update");

    const parsed = updateSpendingSchema.parse(input);
    const { id, ...data } = parsed;

    const existing = await prisma.financialRecord.findFirst({
      where: { id, familyId: session.user.familyId, deletedAt: null },
    });

    if (!existing) {
      return { success: false, error: "Record not found." };
    }

    const record = await prisma.financialRecord.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        recordType: data.recordType,
        date: data.date,
        propertyId: data.propertyId,
        tags: data.tags,
        notes: data.notes,
      },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "financial_record",
      entityId: record.id,
      action: "updated",
      metadata: {
        name: record.name,
        amount: Number(record.amount),
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeFinancialRecord(record) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteSpendingRecord(
  id: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:delete");

    await prisma.financialRecord.update({
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
      entityType: "financial_record",
      entityId: id,
      action: "deleted",
    });

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

interface AttachDocumentInput {
  recordId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export async function attachDocumentToSpending(
  input: AttachDocumentInput,
): Promise<ActionResult<{ uploadUrl: string; document: Document }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:create");

    const existing = await prisma.financialRecord.findFirst({
      where: {
        id: input.recordId,
        familyId: session.user.familyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return { success: false, error: "Record not found." };
    }

    const storageKey = generateStorageKey(
      session.user.familyId,
      input.fileName,
    );

    const uploadUrl = await getUploadUrl(storageKey, input.mimeType);

    const document = await prisma.document.create({
      data: {
        familyId: session.user.familyId,
        uploadedBy: session.user.id,
        fileName: input.fileName,
        storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        propertyId: existing.propertyId,
      },
    });

    await prisma.documentLink.create({
      data: {
        documentId: document.id,
        entityType: "financial_record",
        entityId: input.recordId,
      },
    });

    revalidatePath("/");
    return { success: true, data: { uploadUrl, document } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getSpendingDocumentUrl(
  recordId: string,
): Promise<ActionResult<{ downloadUrl: string; fileName: string; mimeType: string }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:read");

    const link = await prisma.documentLink.findFirst({
      where: { entityType: "financial_record", entityId: recordId },
      include: { document: true },
    });

    if (!link || link.document.deletedAt) {
      return { success: false, error: "No document attached." };
    }

    const downloadUrl = await getDownloadUrl(link.document.storageKey);

    return {
      success: true,
      data: {
        downloadUrl,
        fileName: link.document.fileName,
        mimeType: link.document.mimeType,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
