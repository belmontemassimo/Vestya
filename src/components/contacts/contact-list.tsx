"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { ContactCard } from "@/components/contacts/contact-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  category: string;
  phone?: string | null;
  email?: string | null;
  phones?: unknown;
  emails?: unknown;
}

const CATEGORIES = [
  "PLUMBER", "ELECTRICIAN", "GARDENER", "CLEANER", "HANDYMAN",
  "REAL_ESTATE_AGENT", "NOTARY", "LAWYER", "INSURANCE", "PROPERTY_MANAGER",
  "TENANT", "NEIGHBOR", "CONTRACTOR", "ARCHITECT", "LOCKSMITH",
  "PEST_CONTROL", "HVAC", "ROOFER", "PAINTER", "OTHER",
] as const;

interface ContactListProps {
  contacts: readonly Contact[];
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  onAdd?: () => void;
}

export function ContactList({
  contacts,
  categoryFilter = "all",
  onCategoryChange,
  onAdd,
}: ContactListProps) {
  const t = useTranslations("contacts");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={categoryFilter} onValueChange={onCategoryChange ?? (() => {})}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filterByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t(`category.${cat}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            onAdd ? (
              <Button onClick={onAdd}>{t("addContact")}</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => {
            const phones = Array.isArray(contact.phones) ? contact.phones : [];
            const emails = Array.isArray(contact.emails) ? contact.emails : [];
            const phone =
              contact.phone ??
              (phones.length > 0 && typeof phones[0] === "string"
                ? phones[0]
                : null);
            const email =
              contact.email ??
              (emails.length > 0 && typeof emails[0] === "string"
                ? emails[0]
                : null);
            return (
              <ContactCard
                key={contact.id}
                id={contact.id}
                name={contact.name}
                company={contact.company}
                category={contact.category}
                phone={phone}
                email={email}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
