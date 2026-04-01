"use client";

import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyContactsWidgetProps {
  contacts: Array<{
    id: string;
    name: string;
    company?: string | null;
    category: string;
    phones: unknown;
    relationshipType?: string;
  }>;
}

export function PropertyContactsWidget({
  contacts,
}: PropertyContactsWidgetProps) {
  const visible = contacts.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <Users className="h-8 w-8" />
        <p className="text-sm">No contacts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {contact.name}
            </p>
            {contact.company && (
              <p className="truncate text-xs text-slate-500">
                {contact.company}
              </p>
            )}
          </div>
          <Badge variant="outline" className="ml-2 shrink-0 text-xs">
            {contact.category}
          </Badge>
        </div>
      ))}
      {contacts.length > 5 && (
        <p className="text-center text-xs text-slate-400">
          +{contacts.length - 5} more
        </p>
      )}
    </div>
  );
}
