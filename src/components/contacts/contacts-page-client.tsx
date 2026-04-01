"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact } from "@/actions/contact.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter, usePathname } from "@/i18n/navigation";

interface ContactsPageClientProps {
  contacts: Parameters<typeof ContactList>[0]["contacts"];
  currentCategory?: string;
}

export function ContactsPageClient({
  contacts,
  currentCategory,
}: ContactsPageClientProps) {
  const t = useTranslations("contacts");
  const [dialogOpen, setDialogOpen] = useState(false);
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

  async function handleSubmit(values: Record<string, unknown>) {
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value)
      .filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value)
      .filter(Boolean) ?? [];
    const result = await createContact({ ...values, phones, emails });
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

      <ContactList
        contacts={contacts}
        categoryFilter={currentCategory ?? "all"}
        onCategoryChange={handleCategoryChange}
      />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addContact")}>
        <ContactForm onSubmit={handleSubmit} />
      </FormDialog>
    </div>
  );
}
