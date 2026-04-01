"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  startAt: Date | string;
  propertyName?: string;
  property?: { id: string; name: string } | null;
  allDay: boolean;
}

interface UpcomingEventsProps {
  events: readonly Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("upcomingEvents")}</CardTitle>
        <Link
          href="/calendar"
          className="text-sm text-blue-600 hover:underline"
        >
          {t("viewAll")}
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            {t("noUpcomingEvents")}
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/calendar?event=${event.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {event.propertyName ?? event.property?.name}
                  </p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDateShort(
                    typeof event.startAt === "string"
                      ? event.startAt
                      : event.startAt.toISOString(),
                    locale
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
