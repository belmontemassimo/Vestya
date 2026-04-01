"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface FamilyContactsWidgetProps {
  contacts: Array<{
    id: string;
    name: string;
    company?: string | null;
    category: string;
    phones: unknown;
  }>;
}

export function FamilyContactsWidget({ contacts }: FamilyContactsWidgetProps) {
  const t = useTranslations("contacts");

  if (contacts.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noContacts")}
      </p>
    );
  }

  const displayed = contacts.slice(0, 5);

  return (
    <div className="space-y-2.5">
      {displayed.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">
              {contact.name}
            </p>
            {contact.company && (
              <p className="truncate text-xs text-slate-400">
                {contact.company}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {t(`category.${contact.category}`)}
          </Badge>
        </div>
      ))}
    </div>
  );
}
