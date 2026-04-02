"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactCardProps {
  id: string;
  name: string;
  company: string | null;
  category: string;
  phone: string | null;
  email: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CATEGORY_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  CONTRACTOR: "default",
  TENANT: "secondary",
  VENDOR: "outline",
  AGENT: "secondary",
  NEIGHBOR: "outline",
  OTHER: "outline",
};

export function ContactCard({
  id,
  name,
  company,
  category,
  phone,
  email,
  onEdit,
  onDelete,
}: ContactCardProps) {
  const t = useTranslations("contacts");

  return (
    <Card className="relative transition-shadow hover:shadow-md h-full">
      <Link href={`/contacts/${id}`} className="absolute inset-0 z-0" />

      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <CardTitle className="text-base truncate">{name}</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant={CATEGORY_VARIANTS[category] ?? "outline"}>
            {t(`category.${category}`)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("editContact")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteContact")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {company && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{company}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
