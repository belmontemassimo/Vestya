import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { SpendingPageClient } from "@/components/spending/spending-page-client";

export default async function SpendingPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [records, expenseSum, incomeSum, properties] = await Promise.all([
    prisma.financialRecord.findMany({
      where: { familyId, deletedAt: null },
      include: {
        property: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
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
  ]);

  const totalExpenses = Number(expenseSum._sum.amount ?? 0);
  const totalIncome = Number(incomeSum._sum.amount ?? 0);
  const netBalance = totalIncome - totalExpenses;

  const propertyOptions = properties.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <SpendingPageClient
      records={records}
      totalExpenses={totalExpenses}
      totalIncome={totalIncome}
      netBalance={netBalance}
      properties={propertyOptions}
    />
  );
}
