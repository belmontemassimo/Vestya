import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "en"
): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "PPP", {
    locale: locale === "fr" ? fr : enUS,
  });
}

export function formatDateShort(date: Date | string, locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "PP", {
    locale: locale === "fr" ? fr : enUS,
  });
}

export function formatRelativeDate(
  date: Date | string,
  locale = "en"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: locale === "fr" ? fr : enUS,
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
