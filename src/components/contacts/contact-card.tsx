"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContactCardProps {
  id: string;
  name: string;
  company: string | null;
  category: string;
  phone: string | null;
  email: string | null;
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
}: ContactCardProps) {
  const t = useTranslations("contacts");

  return (
    <Link href={`/contacts/${id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
          <CardTitle className="text-base truncate">{name}</CardTitle>
          <Badge variant={CATEGORY_VARIANTS[category] ?? "outline"}>
            {t(`category.${category}`)}
          </Badge>
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
    </Link>
  );
}
