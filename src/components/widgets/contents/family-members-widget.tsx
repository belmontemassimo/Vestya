"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

interface FamilyMembersWidgetProps {
  members: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    image?: string | null;
  }>;
}

export function FamilyMembersWidget({ members }: FamilyMembersWidgetProps) {
  const t = useTranslations("members");

  if (members.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noMembers")}
      </p>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="space-y-2.5">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(member.name || member.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {member.name || member.email}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {t(`roles.${member.role}`)}
            </Badge>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
