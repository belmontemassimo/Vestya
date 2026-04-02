"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import { createEvent } from "@/actions/event.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  propertyId?: string | null;
  propertyName?: string | null;
  linkedContactId?: string | null;
}

interface SelectOption {
  value: string;
  label: string;
}

interface CalendarPageClientProps {
  events: readonly CalendarEvent[];
  properties: readonly SelectOption[];
  contacts: readonly SelectOption[];
}

export function CalendarPageClient({
  events,
  properties,
  contacts,
}: CalendarPageClientProps) {
  const t = useTranslations("calendar");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("__all__");
  const [contactFilter, setContactFilter] = useState("__all__");
  const router = useRouter();

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (propertyFilter !== "__all__") {
        if (propertyFilter === "__none__") {
          if (ev.propertyId) return false;
        } else {
          if (ev.propertyId !== propertyFilter) return false;
        }
      }
      if (contactFilter !== "__all__") {
        if (contactFilter === "__none__") {
          if (ev.linkedContactId) return false;
        } else {
          if (ev.linkedContactId !== contactFilter) return false;
        }
      }
      return true;
    });
  }, [events, propertyFilter, contactFilter]);

  async function handleSubmit(values: Record<string, unknown>) {
    const payload = {
      ...values,
      startAt: values.startAt,
      linkedContactId: values.contactId || undefined,
    };
    delete (payload as Record<string, unknown>).contactId;
    const result = await createEvent(payload);
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
          {t("addEvent")}
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("allProperties")}</SelectItem>
            <SelectItem value="__none__">{t("noProperty")}</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={contactFilter} onValueChange={setContactFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("allContacts")}</SelectItem>
            <SelectItem value="__none__">{t("noContact")}</SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CalendarView events={filteredEvents} />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addEvent")}>
        <EventForm
          properties={properties}
          contacts={contacts}
          onSubmit={handleSubmit}
          onSuccess={() => setDialogOpen(false)}
        />
      </FormDialog>
    </div>
  );
}
