"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import {
  createSpendingSchema,
  updateSpendingSchema,
} from "@/schemas/spending.schema";
import { paginationSchema } from "@/schemas/common.schema";
import type { ActionResult, PaginatedResult } from "@/types/api";
import type {
  FinancialRecord,
  FinancialCategory,
  RecordType,
} from "@prisma/client";
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
        ...parsed,
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
        category: record.category,
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

    const record = await prisma.financialRecord.update({
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
      entityType: "financial_record",
      entityId: record.id,
      action: "updated",
      metadata: {
        category: record.category,
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

interface SpendingFilters {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  category?: FinancialCategory;
  recordType?: RecordType;
  startDate?: string;
  endDate?: string;
}

export async function getSpendingRecords(
  filters?: SpendingFilters,
): Promise<ActionResult<PaginatedResult<FinancialRecord>>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:read");

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
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.recordType ? { recordType: filters.recordType } : {}),
      ...(Object.keys(dateFilters).length > 0
        ? { date: dateFilters }
        : {}),
      ...(search
        ? {
            OR: [
              { notes: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          property: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
        },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map(serializeFinancialRecord) as FinancialRecord[],
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

interface CategorySummary {
  category: FinancialCategory;
  total: number;
}

interface MonthlySummary {
  month: string;
  expenses: number;
  income: number;
}

interface SpendingSummaryData {
  totalExpenses: number;
  totalIncome: number;
  byCategory: CategorySummary[];
  byMonth: MonthlySummary[];
}

export async function getSpendingSummary(): Promise<
  ActionResult<SpendingSummaryData>
> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "spending:read");

    const baseWhere = {
      familyId: session.user.familyId,
      deletedAt: null,
    };

    const [expenseAgg, incomeAgg, byCategoryRaw, allRecords] =
      await Promise.all([
        prisma.financialRecord.aggregate({
          where: { ...baseWhere, recordType: "EXPENSE" },
          _sum: { amount: true },
        }),
        prisma.financialRecord.aggregate({
          where: { ...baseWhere, recordType: "INCOME" },
          _sum: { amount: true },
        }),
        prisma.financialRecord.groupBy({
          by: ["category"],
          where: baseWhere,
          _sum: { amount: true },
        }),
        prisma.financialRecord.findMany({
          where: baseWhere,
          select: {
            date: true,
            amount: true,
            recordType: true,
          },
          orderBy: { date: "asc" },
        }),
      ]);

    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const totalIncome = Number(incomeAgg._sum.amount ?? 0);

    const byCategory: CategorySummary[] = byCategoryRaw.map((row) => ({
      category: row.category,
      total: Number(row._sum.amount ?? 0),
    }));

    const monthlyMap = new Map<
      string,
      { expenses: number; income: number }
    >();

    for (const record of allRecords) {
      const d = new Date(record.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) ?? {
        expenses: 0,
        income: 0,
      };

      if (record.recordType === "EXPENSE") {
        monthlyMap.set(monthKey, {
          ...existing,
          expenses: existing.expenses + Number(record.amount),
        });
      } else {
        monthlyMap.set(monthKey, {
          ...existing,
          income: existing.income + Number(record.amount),
        });
      }
    }

    const byMonth: MonthlySummary[] = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month,
        expenses: data.expenses,
        income: data.income,
      }),
    );

    return {
      success: true,
      data: {
        totalExpenses,
        totalIncome,
        byCategory,
        byMonth,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
