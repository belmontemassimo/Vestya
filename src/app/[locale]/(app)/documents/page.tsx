import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import type { TagOption } from "@/components/documents/document-upload-form";

export default async function DocumentsPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const [documents, properties, memberships, contacts] = await Promise.all([
    prisma.document.findMany({
      where: { familyId, deletedAt: null },
      include: {
        property: { select: { id: true, name: true } },
        uploader: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
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
  ]);

  const tagOptions: TagOption[] = [
    ...properties.map((p) => ({ value: p.id, label: p.name, type: "property" as const })),
    ...memberships.map((m) => ({
      value: m.user.id,
      label: m.user.name ?? m.user.id,
      type: "member" as const,
    })),
    ...contacts.map((c) => ({ value: c.id, label: c.name, type: "contact" as const })),
  ];

  return (
    <DocumentsPageClient
      documents={documents}
      tagOptions={tagOptions}
    />
  );
}
