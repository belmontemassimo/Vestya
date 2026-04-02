"use client";

import { useTranslations, useLocale } from "next-intl";
import { DollarSign } from "lucide-react";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

interface SpendingRecord {
  id: string;
  date: Date | string;
  propertyName?: string;
  property?: { id: string; name: string } | null;
  category: string;
  description?: string;
  notes?: string | null;
  amount: unknown;
  type?: "EXPENSE" | "INCOME";
  recordType?: string;
  currency: string;
  paymentStatus: string;
}

interface SpendingTableProps {
  records: readonly SpendingRecord[];
}

const PAYMENT_STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "destructive" as "warning",
  CANCELLED: "secondary",
};

export function SpendingTable({ records }: SpendingTableProps) {
  const t = useTranslations("spending");
  const locale = useLocale();

  if (records.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("property")}</TableHead>
            <TableHead>{t("category")}</TableHead>
            <TableHead>{t("description")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead>{t("paymentStatus")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                {formatDateShort(
                  typeof record.date === "string"
                    ? record.date
                    : record.date.toISOString(),
                  locale
                )}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {record.propertyName ?? record.property?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(`category.${record.category}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-700 max-w-[200px] truncate">
                {record.description ?? record.notes ?? "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm font-medium whitespace-nowrap",
                  (record.type ?? record.recordType) === "INCOME"
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {(record.type ?? record.recordType) === "INCOME" ? "+" : "-"}
                {formatCurrency(Number(record.amount), record.currency, locale)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    PAYMENT_STATUS_VARIANTS[record.paymentStatus] ?? "secondary"
                  }
                >
                  {t(`paymentStatus.${record.paymentStatus}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
