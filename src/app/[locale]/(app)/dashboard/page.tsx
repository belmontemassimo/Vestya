import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getFamilyDashboard } from "@/actions/dashboard.actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const [
    layoutResult,
    tasks,
    events,
    members,
    contacts,
    messages,
    reminders,
    documents,
    properties,
  ] = await Promise.all([
    getFamilyDashboard(),
    prisma.task.findMany({
      where: {
        familyId,
        deletedAt: null,
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      include: { property: { select: { name: true } } },
      orderBy: { dueAt: "asc" },
      take: 10,
    }),
    prisma.event.findMany({
      where: {
        familyId,
        deletedAt: null,
        startAt: { gte: new Date() },
      },
      include: { property: { select: { name: true } } },
      orderBy: { startAt: "asc" },
      take: 10,
    }),
    prisma.familyMembership.findMany({
      where: { familyId, status: "ACTIVE" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
    prisma.contact.findMany({
      where: { familyId, deletedAt: null },
      orderBy: { name: "asc" },
      take: 10,
    }),
    prisma.message.findMany({
      where: { familyId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.reminder.findMany({
      where: {
        familyId,
        status: "PENDING",
        remindAt: { gte: new Date() },
      },
      orderBy: { remindAt: "asc" },
      take: 10,
    }),
    prisma.document.findMany({
      where: { familyId, deletedAt: null },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const layout = layoutResult.success ? layoutResult.data : null;

  const tagOptions = [
    ...properties.map((p) => ({ value: p.id, label: p.name, type: "property" as const })),
    ...members.map((m) => ({
      value: m.user.id,
      label: m.user.name ?? m.user.email,
      type: "member" as const,
    })),
  ];

  const dashboardData = {
    tasks: JSON.parse(JSON.stringify(tasks)),
    events: JSON.parse(JSON.stringify(events)),
    members: members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
    })),
    contacts: JSON.parse(JSON.stringify(contacts)),
    messages: JSON.parse(JSON.stringify(messages)),
    reminders: JSON.parse(JSON.stringify(reminders)),
    documents: JSON.parse(JSON.stringify(documents)),
    properties: properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      country: p.country,
      propertyType: p.propertyType,
      status: p.status,
      latitude: p.latitude,
      longitude: p.longitude,
      images: p.images,
    })),
    tagOptions,
  };

  return (
    <DashboardClient initialLayout={layout} dashboardData={dashboardData} />
  );
}
