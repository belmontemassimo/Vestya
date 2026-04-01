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

  const contacts = await prisma.contact.findMany({
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
  });

  return (
    <ContactsPageClient
      contacts={contacts}
      currentCategory={searchParams.category}
    />
  );
}
