import { notFound } from "next/navigation";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ContactDetail } from "@/components/contacts/contact-detail";

interface ContactDetailPageProps {
  params: { contactId: string; locale: string };
}

export default async function ContactDetailPage({
  params: { contactId },
}: ContactDetailPageProps) {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, familyId, deletedAt: null },
    include: {
      propertyContacts: {
        include: {
          property: { select: { id: true, name: true, status: true } },
        },
      },
      assignedTasks: {
        where: { deletedAt: null },
        include: {
          property: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      paidFinancials: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contact.name}
        subtitle={contact.company ?? undefined}
      />

      <ContactDetail contact={contact} />
    </div>
  );
}
