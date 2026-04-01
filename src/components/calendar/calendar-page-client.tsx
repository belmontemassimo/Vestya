"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import { createEvent } from "@/actions/event.actions";
import { FormDialog } from "@/components/shared/form-dialog";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
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
  const router = useRouter();

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

      <CalendarView events={events} />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addEvent")}>
        <EventForm
          properties={properties}
          contacts={contacts}
          onSubmit={handleSubmit}
        />
      </FormDialog>
    </div>
  );
}
