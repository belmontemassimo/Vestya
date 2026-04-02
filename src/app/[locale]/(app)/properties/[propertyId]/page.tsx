import { notFound } from "next/navigation";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getPropertyDashboard } from "@/actions/dashboard.actions";
import { PropertyDashboardClient } from "./property-dashboard-client";

interface PropertyDetailPageProps {
  params: { propertyId: string; locale: string };
}

export default async function PropertyDetailPage({
  params: { propertyId },
}: PropertyDetailPageProps) {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, familyId, deletedAt: null },
  });

  if (!property) {
    notFound();
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    layoutResult,
    tasks,
    events,
    propertyContacts,
    documents,
    expenses,
    income,
    financialRecords,
    reminders,
    memberships,
  ] = await Promise.all([
    getPropertyDashboard(propertyId),

    prisma.task.findMany({
      where: {
        propertyId,
        deletedAt: null,
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      orderBy: { dueAt: "asc" },
      take: 10,
    }),

    prisma.event.findMany({
      where: {
        propertyId,
        deletedAt: null,
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 10,
    }),

    prisma.propertyContact.findMany({
      where: { propertyId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
            category: true,
            phones: true,
          },
        },
      },
    }),

    prisma.document.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.financialRecord.aggregate({
      where: {
        propertyId,
        deletedAt: null,
        recordType: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    prisma.financialRecord.aggregate({
      where: {
        propertyId,
        deletedAt: null,
        recordType: "INCOME",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    prisma.financialRecord.findMany({
      where: { propertyId, deletedAt: null },
      select: {
        id: true,
        category: true,
        amount: true,
        currency: true,
        recordType: true,
        date: true,
        notes: true,
      },
      orderBy: { date: "desc" },
      take: 10,
    }),

    prisma.reminder.findMany({
      where: {
        propertyId,
        status: "PENDING",
        remindAt: { gte: now },
      },
      orderBy: { remindAt: "asc" },
      take: 10,
    }),

    prisma.familyMembership.findMany({
      where: { familyId, status: "ACTIVE" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const layout = layoutResult.success ? layoutResult.data : null;

  const address = [
    property.addressLine1,
    property.addressLine2,
    property.city,
    property.region,
    property.postalCode,
    property.country,
  ]
    .filter(Boolean)
    .join(", ");

  const contacts = propertyContacts.map((pc) => ({
    id: pc.contact.id,
    name: pc.contact.name,
    company: pc.contact.company,
    category: pc.contact.category,
    phones: pc.contact.phones,
    relationshipType: pc.relationshipType,
  }));

  const tagOptions = [
    { value: propertyId, label: property.name, type: "property" as const },
    ...memberships.map((m) => ({
      value: m.user.id,
      label: m.user.name ?? m.user.email,
      type: "member" as const,
    })),
  ];

  const dashboardData = {
    tasks: JSON.parse(JSON.stringify(tasks)),
    events: JSON.parse(JSON.stringify(events)),
    contacts: JSON.parse(JSON.stringify(contacts)),
    documents: JSON.parse(JSON.stringify(documents)),
    totalExpenses: Number(expenses._sum.amount ?? 0),
    totalIncome: Number(income._sum.amount ?? 0),
    financialRecords: financialRecords.map((r) => ({
      ...r,
      amount: Number(r.amount),
      date: r.date.toISOString(),
    })),
    reminders: JSON.parse(JSON.stringify(reminders)),
    tagOptions,
    autoSelectedTags: [propertyId],
  };

  return (
    <PropertyDashboardClient
      propertyId={propertyId}
      propertyName={property.name}
      propertyAddress={address}
      propertyStatus={property.status}
      initialLayout={layout}
      dashboardData={dashboardData}
    />
  );
}
