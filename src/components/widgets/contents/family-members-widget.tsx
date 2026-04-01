"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();

  function handleMemberClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push("/members" as never);
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        {t("title")}
      </h3>

      {members.length === 0 ? (
        <p className="text-xs italic text-slate-400">{t("noMembers")}</p>
      ) : (
        <div className="space-y-1.5 overflow-y-auto">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={handleMemberClick}
              className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-slate-100"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">
                  {member.name ?? member.email}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {member.email}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[9px]">
                {t(`roles.${member.role}`)}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
