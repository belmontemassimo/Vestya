import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";

export default async function DocumentsPage() {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const [documents, properties] = await Promise.all([
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
  ]);

  const propertyOptions = properties.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <DocumentsPageClient
      documents={documents}
      properties={propertyOptions}
    />
  );
}
