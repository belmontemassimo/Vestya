import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { SpendingPageClient } from "@/components/spending/spending-page-client";
import type { TagOption } from "@/components/spending/spending-form";

export default async function SpendingPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [records, expenseSum, incomeSum, properties, memberships, contacts, documentLinks] =
    await Promise.all([
      prisma.financialRecord.findMany({
        where: { familyId, deletedAt: null },
        include: {
          property: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      }),

      prisma.financialRecord.aggregate({
        where: {
          familyId,
          deletedAt: null,
          recordType: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      prisma.financialRecord.aggregate({
        where: {
          familyId,
          deletedAt: null,
          recordType: "INCOME",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
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

      prisma.contact.findMany({
        where: { familyId, deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),

      prisma.documentLink.findMany({
        where: { entityType: "financial_record" },
        select: { entityId: true },
      }),
    ]);

  const totalExpenses = Number(expenseSum._sum.amount ?? 0);
  const totalIncome = Number(incomeSum._sum.amount ?? 0);
  const netBalance = totalIncome - totalExpenses;

  const propertyOptions = properties.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const tagOptions: TagOption[] = [
    ...properties.map((p) => ({
      value: p.id,
      label: p.name,
      type: "property" as const,
    })),
    ...memberships.map((m) => ({
      value: m.user.id,
      label: m.user.name ?? m.user.id,
      type: "member" as const,
    })),
    ...contacts.map((c) => ({
      value: c.id,
      label: c.name,
      type: "contact" as const,
    })),
  ];

  // Build a set of record IDs that have attached documents
  const recordsWithDocs = new Set(documentLinks.map((l) => l.entityId));

  const serializedRecords = records.map((r) => ({
    id: r.id,
    name: r.name,
    date: r.date.toISOString(),
    amount: Number(r.amount),
    recordType: r.recordType,
    tags: r.tags,
    notes: r.notes,
    property: r.property,
    hasDocument: recordsWithDocs.has(r.id),
  }));

  return (
    <SpendingPageClient
      records={serializedRecords}
      totalExpenses={totalExpenses}
      totalIncome={totalIncome}
      netBalance={netBalance}
      properties={propertyOptions}
      tagOptions={tagOptions}
    />
  );
}
