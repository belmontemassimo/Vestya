import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const now = new Date();
  const threeMonthsLater = new Date(
    now.getFullYear(),
    now.getMonth() + 3,
    now.getDate()
  );

  const [events, properties, contacts] = await Promise.all([
    prisma.event.findMany({
      where: {
        familyId,
        deletedAt: null,
        startAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: threeMonthsLater,
        },
      },
      include: {
        property: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { familyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startAt.toISOString(),
    end: event.endAt?.toISOString(),
    allDay: event.allDay,
  }));

  const propertyOptions = properties.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const contactOptions = contacts.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <CalendarPageClient
      events={serializedEvents}
      properties={propertyOptions}
      contacts={contactOptions}
    />
  );
}
