"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact } from "@/actions/contact.actions";

interface PropertyContactsWidgetProps {
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

function firstOf(arr: unknown): string | null {
  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string") return arr[0];
  return null;
}

export function PropertyContactsWidget({ contacts, propertyId }: PropertyContactsWidgetProps) {
  const t = useTranslations("contacts");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleCreate(values: Record<string, unknown>) {
    const phones = (values.phones as { value: string }[] | undefined)
      ?.map((p) => p.value).filter(Boolean) ?? [];
    const emails = (values.emails as { value: string }[] | undefined)
      ?.map((e) => e.value).filter(Boolean) ?? [];
    const result = await createContact({ ...values, phones, emails });
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
              const email = firstOf(contact.emails);
              const phone = firstOf(contact.phones);
              return (
                <div key={contact.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                  <span className="shrink-0 text-xs font-medium text-slate-800">{contact.name}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">
                    {[email, phone].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addContact")}>
        <ContactForm onSubmit={handleCreate} />
      </FormDialog>
    </>
  );
}
