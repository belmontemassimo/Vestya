"use client";

import { useTranslations, useLocale } from "next-intl";
import { Phone, Mail, MapPin, Building2, Tag, FileText } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";

interface ContactDetailProps {
  contact: {
    id: string;
    name: string;
    company: string | null;
    category: string;
    phones: unknown;
    emails: unknown;
    whatsapp: string | null;
    address: string | null;
    notes: string | null;
    tags: unknown;
    propertyContacts: Array<{
      id: string;
      property: {
        id: string;
        name: string;
        status: string;
      };
    }>;
    assignedTasks: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      dueAt: Date | null;
      property: { id: string; name: string } | null;
    }>;
    paidFinancials: Array<{
      id: string;
      name: string;
      date: Date;
      amount: unknown;
      recordType: string;
    }>;
  };
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const t = useTranslations("contacts");
  const locale = useLocale();

  const phones = toStringArray(contact.phones);
  const emails = toStringArray(contact.emails);
  const tags = toStringArray(contact.tags);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t(`category.${contact.category}`)}</Badge>
            </div>

            {contact.company && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{contact.company}</span>
              </div>
            )}

            {phones.map((phone) => (
              <div key={phone} className="flex items-start gap-2 text-sm text-slate-700">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            ))}

            {emails.map((email) => (
              <div key={email} className="flex items-start gap-2 text-sm text-slate-700">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a href={`mailto:${email}`} className="hover:underline truncate">
                  {email}
                </a>
              </div>
            ))}

            {contact.address && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{contact.address}</span>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="leading-relaxed">{contact.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {contact.propertyContacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("linkedProperties")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contact.propertyContacts.map((pc) => (
                <Link
                  key={pc.id}
                  href={`/properties/${pc.property.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-900">
                    {pc.property.name}
                  </span>
                  <Badge variant="outline">{pc.property.status}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("assignedTasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.assignedTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                {t("noTasks")}
              </p>
            ) : (
              <div className="space-y-3">
                {contact.assignedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {task.title}
                      </p>
                      {task.property && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {task.property.name}
                          {task.dueAt && (
                            <span className="ml-2">
                              {formatDateShort(
                                task.dueAt.toISOString(),
                                locale
                              )}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {contact.paidFinancials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("financialHistory")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.paidFinancials.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {record.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateShort(record.date.toISOString(), locale)}
                    </p>
                  </div>
                  <span
                    className={
                      record.recordType === "INCOME"
                        ? "text-sm font-semibold text-green-600 ml-3"
                        : "text-sm font-semibold text-red-600 ml-3"
                    }
                  >
                    {record.recordType === "INCOME" ? "+" : "-"}
                    {Number(record.amount).toLocaleString()} EUR
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
