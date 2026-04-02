"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact, linkContactToProperty } from "@/actions/contact.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PropertyOption {
  id: string;
  name: string;
}

interface ContactsPageClientProps {
  contacts: Parameters<typeof ContactList>[0]["contacts"];
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
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // Contacts linked to any property
  const linkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const arr of Object.values(propertyContactMap)) {
      for (const id of arr) ids.add(id);
    }
    return ids;
  }, [propertyContactMap]);

  // Filter contacts based on active tab
  const filteredContacts = useMemo(() => {
    if (activeTab === "all") return contacts;
    if (activeTab === "family") {
      return contacts.filter((c) => !linkedContactIds.has(c.id));
    }
    // Property tab: filter by propertyContactMap
    const contactIds = new Set(propertyContactMap[activeTab] ?? []);
    return contacts.filter((c) => contactIds.has(c.id));
  }, [contacts, activeTab, propertyContactMap, linkedContactIds]);

  // Property ID for the active tab (if it's a property tab)
  const activePropertyId = activeTab !== "all" && activeTab !== "family" ? activeTab : undefined;

  async function handleSubmit(values: Record<string, unknown>) {
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value)
      .filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value)
      .filter(Boolean) ?? [];
    const result = await createContact({ ...values, phones, emails });
    if (result.success && activePropertyId) {
      await linkContactToProperty(result.data.id, activePropertyId);
    }
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addContact")}
        </button>
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
            onAdd={() => setDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addContact")}>
        <ContactForm onSubmit={handleSubmit} />
      </FormDialog>
    </div>
  );
}
