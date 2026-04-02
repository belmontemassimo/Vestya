"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact } from "@/actions/contact.actions";

interface FamilyContactsWidgetProps {
  contacts: Array<{
    id: string;
    name: string;
    company?: string | null;
    category: string;
    phones?: unknown;
    emails?: unknown;
  }>;
  propertyId?: string;
}

function firstPhone(phones: unknown): string | null {
  if (Array.isArray(phones) && phones.length > 0 && typeof phones[0] === "string") {
    return phones[0];
  }
  return null;
}

function firstEmail(emails: unknown): string | null {
  if (Array.isArray(emails) && emails.length > 0 && typeof emails[0] === "string") {
    return emails[0];
  }
  return null;
}

export function FamilyContactsWidget({ contacts, propertyId }: FamilyContactsWidgetProps) {
  const t = useTranslations("contacts");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleContactClick(e: React.MouseEvent, contactId: string) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/contacts/${contactId}` as never);
  }

  async function handleCreate(values: Record<string, unknown>) {
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value)
      .filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value)
      .filter(Boolean) ?? [];
    const payload = propertyId
      ? { ...values, phones, emails, propertyId }
      : { ...values, phones, emails };
    const result = await createContact(payload);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <WidgetHeader title={t("title")} onAdd={() => setDialogOpen(true)} addLabel={t("addContact")} />

        {contacts.length === 0 ? (
          <p className="text-xs italic text-slate-400">{t("noContacts")}</p>
        ) : (
          <div className="space-y-1.5 overflow-y-auto">
            {contacts.slice(0, 8).map((contact) => {
              const phone = firstPhone(contact.phones);
              const email = firstEmail(contact.emails);
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={(e) => handleContactClick(e, contact.id)}
                  className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-slate-100"
                >
                  <span className="shrink-0 text-xs font-medium text-slate-800">
                    {contact.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">
                    {[email, phone].filter(Boolean).join(" · ") || "\u2014"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addContact")}>
        <ContactForm onSubmit={handleCreate} onSuccess={() => setDialogOpen(false)} />
      </FormDialog>
    </>
  );
}
