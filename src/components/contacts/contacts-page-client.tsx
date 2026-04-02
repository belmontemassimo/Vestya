"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Link2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactForm } from "@/components/contacts/contact-form";
import { DeleteContactDialog } from "@/components/contacts/delete-contact-dialog";
import { LinkContactDialog } from "@/components/contacts/link-contact-dialog";
import {
  createContact,
  updateContact,
  deleteContact,
  linkContactToProperty,
  setContactPropertyLinks,
} from "@/actions/contact.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PropertyOption {
  id: string;
  name: string;
}

interface ContactData {
  id: string;
  name: string;
  company: string | null;
  category: string;
  notes?: string | null;
  phones?: unknown;
  emails?: unknown;
}

interface ContactsPageClientProps {
  contacts: readonly ContactData[];
  currentCategory?: string;
  properties?: readonly PropertyOption[];
  propertyContactMap?: Record<string, string[]>;
}

export function ContactsPageClient({
  contacts,
  currentCategory,
  properties = [],
  propertyContactMap = {},
}: ContactsPageClientProps) {
  const t = useTranslations("contacts");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);
  const [deletingContact, setDeletingContact] = useState<ContactData | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete("category");
      } else {
        params.set("category", value);
      }
      router.push(`${pathname}?${params.toString()}` as never);
    },
    [searchParams, pathname, router],
  );

  const linkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const arr of Object.values(propertyContactMap)) {
      for (const id of arr) ids.add(id);
    }
    return ids;
  }, [propertyContactMap]);

  const filteredContacts = useMemo(() => {
    if (activeTab === "all") return contacts;
    if (activeTab === "family") {
      return contacts.filter((c) => !linkedContactIds.has(c.id));
    }
    const contactIds = new Set(propertyContactMap[activeTab] ?? []);
    return contacts.filter((c) => contactIds.has(c.id));
  }, [contacts, activeTab, propertyContactMap, linkedContactIds]);

  const activePropertyId = activeTab !== "all" && activeTab !== "family" ? activeTab : undefined;

  // Contacts NOT linked to the active property (for link existing dialog)
  const unlinkableContacts = useMemo(() => {
    if (!activePropertyId) return [];
    const linked = new Set(propertyContactMap[activePropertyId] ?? []);
    return contacts.filter((c) => !linked.has(c.id));
  }, [contacts, activePropertyId, propertyContactMap]);

  // Property IDs a specific contact is linked to (for edit form)
  function getLinkedPropertyIds(contactId: string): string[] {
    const ids: string[] = [];
    for (const [propId, contactIds] of Object.entries(propertyContactMap)) {
      if (contactIds.includes(contactId)) ids.push(propId);
    }
    return ids;
  }

  async function handleCreate(values: Record<string, unknown>) {
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value).filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value).filter(Boolean) ?? [];
    const result = await createContact({ ...values, phones, emails });
    if (result.success && activePropertyId) {
      await linkContactToProperty(result.data.id, activePropertyId);
    }
    if (result.success) {
      setCreateDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  async function handleEdit(values: Record<string, unknown>) {
    if (!editingContact) return { success: false, error: "No contact" };
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value).filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value).filter(Boolean) ?? [];
    const result = await updateContact({ id: editingContact.id, ...values, phones, emails });
    if (result.success) {
      setEditingContact(null);
      router.refresh();
    }
    return result;
  }

  async function handlePropertyLinksChange(propertyIds: string[]) {
    if (!editingContact) return;
    await setContactPropertyLinks(editingContact.id, propertyIds);
  }

  async function handleDelete() {
    if (!deletingContact) return;
    const result = await deleteContact(deletingContact.id);
    if (result.success) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  async function handleLinkExisting(contactIds: string[]) {
    if (!activePropertyId) return;
    for (const contactId of contactIds) {
      await linkContactToProperty(contactId, activePropertyId);
    }
    router.refresh();
  }

  function openEdit(id: string) {
    const contact = contacts.find((c) => c.id === id);
    if (contact) setEditingContact(contact);
  }

  function openDelete(id: string) {
    const contact = contacts.find((c) => c.id === id);
    if (contact) setDeletingContact(contact);
  }

  function parsePhones(phones: unknown): { value: string }[] {
    if (!Array.isArray(phones)) return [{ value: "" }];
    return phones.length > 0
      ? phones.filter((p) => typeof p === "string").map((p) => ({ value: p }))
      : [{ value: "" }];
  }

  function parseEmails(emails: unknown): { value: string }[] {
    if (!Array.isArray(emails)) return [{ value: "" }];
    return emails.length > 0
      ? emails.filter((e) => typeof e === "string").map((e) => ({ value: e }))
      : [{ value: "" }];
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <div className="flex items-center gap-2">
          {activePropertyId && (
            <button
              type="button"
              onClick={() => setLinkDialogOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Link2 className="h-4 w-4" />
              {t("linkExisting")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t("addContact")}
          </button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("tabAll")}</TabsTrigger>
          <TabsTrigger value="family">{t("tabFamily")}</TabsTrigger>
          {properties.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ContactList
            contacts={filteredContacts}
            categoryFilter={currentCategory ?? "all"}
            onCategoryChange={handleCategoryChange}
            onAdd={() => setCreateDialogOpen(true)}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </TabsContent>
      </Tabs>

      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={t("addContact")}
      >
        <ContactForm onSubmit={handleCreate} onSuccess={() => setCreateDialogOpen(false)} />
      </FormDialog>

      <FormDialog
        open={!!editingContact}
        onOpenChange={(open) => { if (!open) setEditingContact(null); }}
        title={t("editContact")}
      >
        {editingContact && (
          <ContactForm
            isEditing
            properties={properties}
            linkedPropertyIds={getLinkedPropertyIds(editingContact.id)}
            defaultValues={{
              name: editingContact.name,
              company: editingContact.company ?? "",
              category: editingContact.category as "PLUMBER" | "ELECTRICIAN" | "GARDENER" | "CLEANER" | "HANDYMAN" | "REAL_ESTATE_AGENT" | "NOTARY" | "LAWYER" | "INSURANCE" | "PROPERTY_MANAGER" | "TENANT" | "NEIGHBOR" | "CONTRACTOR" | "ARCHITECT" | "LOCKSMITH" | "PEST_CONTROL" | "HVAC" | "ROOFER" | "PAINTER" | "OTHER",
              notes: editingContact.notes ?? "",
              phones: parsePhones(editingContact.phones),
              emails: parseEmails(editingContact.emails),
            }}
            onSubmit={handleEdit}
            onPropertyLinksChange={handlePropertyLinksChange}
            onSuccess={() => setEditingContact(null)}
          />
        )}
      </FormDialog>

      <DeleteContactDialog
        open={!!deletingContact}
        onOpenChange={(open) => { if (!open) setDeletingContact(null); }}
        contactName={deletingContact?.name ?? ""}
        onConfirm={handleDelete}
      />

      <LinkContactDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        contacts={unlinkableContacts}
        onConfirm={handleLinkExisting}
      />
    </div>
  );
}
