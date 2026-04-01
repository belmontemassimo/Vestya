"use client";

import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal, UserMinus, Shield } from "lucide-react";
import { formatDateShort, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/members/role-badge";

interface Member {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  user?: { id: string; name: string | null; email: string; image: string | null };
  role: string;
  joinedAt: Date | string;
}

interface MemberListProps {
  members: readonly Member[];
  canChangeRole?: boolean;
  canRemove?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  onChangeRole?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  invitations?: readonly unknown[];
}

export function MemberList({
  members,
  canChangeRole = false,
  canRemove = false,
  onChangeRole,
  onRemove,
}: MemberListProps) {
  const t = useTranslations("members");
  const locale = useLocale();

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={(member.image ?? member.user?.image) ?? undefined}
              alt={member.name ?? member.user?.name ?? ""}
            />
            <AvatarFallback>
              {getInitials(member.name ?? member.user?.name ?? "?")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {member.name ?? member.user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {member.email ?? member.user?.email}
            </p>
          </div>

          <RoleBadge role={member.role} />

          <span className="hidden sm:inline text-xs text-slate-400">
            {t("joined")}{" "}
            {formatDateShort(
              typeof member.joinedAt === "string"
                ? member.joinedAt
                : member.joinedAt.toISOString(),
              locale
            )}
          </span>

          {(canChangeRole || canRemove) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canChangeRole && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onChangeRole?.(member.id)}
                  >
                    <Shield className="h-4 w-4" />
                    {t("changeRole")}
                  </DropdownMenuItem>
                )}
                {canRemove && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => onRemove?.(member.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                    {t("removeMember")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  );
}
