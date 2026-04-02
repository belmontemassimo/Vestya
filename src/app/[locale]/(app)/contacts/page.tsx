import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ContactsPageClient } from "@/components/contacts/contacts-page-client";
import type { ContactCategory, Prisma } from "@prisma/client";

interface ContactsPageProps {
  searchParams: {
    category?: string;
  };
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const where: Prisma.ContactWhereInput = {
    familyId,
    deletedAt: null,
  };

  if (searchParams.category) {
    where.category = searchParams.category as ContactCategory;
  }

  const [contacts, properties, propertyContacts] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        _count: {
          select: {
            propertyContacts: true,
            assignedTasks: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.propertyContact.findMany({
      where: {
        property: { familyId, deletedAt: null },
      },
      select: { propertyId: true, contactId: true },
    }),
  ]);

  // Build a map: propertyId -> Set of contactIds
  const propertyContactMap: Record<string, string[]> = {};
  for (const pc of propertyContacts) {
    const arr = propertyContactMap[pc.propertyId] ?? [];
    arr.push(pc.contactId);
    propertyContactMap[pc.propertyId] = arr;
  }

  return (
    <ContactsPageClient
      contacts={JSON.parse(JSON.stringify(contacts))}
      currentCategory={searchParams.category}
      properties={properties}
      propertyContactMap={propertyContactMap}
    />
  );
}
