"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CheckSquare,
  Users,
  FileText,
  DollarSign,
  Home,
  Calendar,
} from "lucide-react";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";

interface PropertyDetailTabsProps {
  property: {
    id: string;
    name: string;
    notes: string | null;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueAt: Date | null;
    assignee: { id: string; name: string | null; image: string | null } | null;
  }>;
  contacts: Array<{
    id: string;
    relationshipType: string;
    contact: {
      id: string;
      name: string;
      category: string;
    };
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
    uploader: { id: string; name: string | null };
  }>;
  financials: Array<{
    id: string;
    date: Date;
    category: string;
    amount: unknown;
    currency: string;
    recordType: string;
    paymentStatus: string;
    contact: { id: string; name: string } | null;
  }>;
  occupancies: Array<{
    id: string;
    type: string;
    startDate: Date;
    endDate: Date | null;
    linkedContact: { id: string; name: string } | null;
  }>;
}

export function PropertyDetailTabs({
  tasks,
  contacts,
  documents,
  financials,
  occupancies,
}: PropertyDetailTabsProps) {
  const t = useTranslations("properties");
  const locale = useLocale();

  return (
    <Tabs defaultValue="tasks">
      <TabsList className="mb-4">
        <TabsTrigger value="tasks">
          <CheckSquare className="mr-1.5 h-4 w-4" />
          {t("tabs.tasks")} ({tasks.length})
        </TabsTrigger>
        <TabsTrigger value="contacts">
          <Users className="mr-1.5 h-4 w-4" />
          {t("tabs.contacts")} ({contacts.length})
        </TabsTrigger>
        <TabsTrigger value="documents">
          <FileText className="mr-1.5 h-4 w-4" />
          {t("tabs.documents")} ({documents.length})
        </TabsTrigger>
        <TabsTrigger value="financials">
          <DollarSign className="mr-1.5 h-4 w-4" />
          {t("tabs.financials")} ({financials.length})
        </TabsTrigger>
        <TabsTrigger value="occupancies">
          <Home className="mr-1.5 h-4 w-4" />
          {t("tabs.occupancies")} ({occupancies.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.tasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {t("noTasks")}
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate flex-1">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 ml-3">
                      {task.dueAt && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDateShort(task.dueAt.toISOString(), locale)}
                        </span>
                      )}
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.contacts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {t("noContacts")}
              </p>
            ) : (
              <div className="space-y-3">
                {contacts.map((pc) => (
                  <Link
                    key={pc.id}
                    href={`/contacts/${pc.contact.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {pc.contact.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pc.contact.category}</Badge>
                      <Badge variant="secondary">{pc.relationshipType}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {t("noDocuments")}
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.uploader.name} &middot;{" "}
                        {formatDateShort(doc.createdAt.toISOString(), locale)}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-3 shrink-0">
                      {Math.round(doc.sizeBytes / 1024)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="financials">
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.financials")}</CardTitle>
          </CardHeader>
          <CardContent>
            {financials.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {t("noFinancials")}
              </p>
            ) : (
              <div className="space-y-3">
                {financials.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {record.category}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateShort(record.date.toISOString(), locale)}
                        {record.contact && ` \u00b7 ${record.contact.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span
                        className={
                          record.recordType === "INCOME"
                            ? "text-sm font-semibold text-green-600"
                            : "text-sm font-semibold text-red-600"
                        }
                      >
                        {record.recordType === "INCOME" ? "+" : "-"}
                        {formatCurrency(
                          Number(record.amount),
                          record.currency,
                          locale
                        )}
                      </span>
                      <Badge variant="outline">{record.paymentStatus}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="occupancies">
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.occupancies")}</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancies.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {t("noOccupancies")}
              </p>
            ) : (
              <div className="space-y-3">
                {occupancies.map((occ) => (
                  <div
                    key={occ.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {occ.type}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateShort(occ.startDate.toISOString(), locale)}
                        {occ.endDate &&
                          ` \u2013 ${formatDateShort(occ.endDate.toISOString(), locale)}`}
                        {occ.linkedContact &&
                          ` \u00b7 ${occ.linkedContact.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
