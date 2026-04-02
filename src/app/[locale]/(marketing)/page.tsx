import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Home,
  CheckSquare,
  Users,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";

const FEATURE_ICONS = [
  { key: "properties", icon: Home },
  { key: "tasks", icon: CheckSquare },
  { key: "contacts", icon: Users },
  { key: "documents", icon: FileText },
  { key: "spending", icon: DollarSign },
  { key: "calendar", icon: Calendar },
] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tAuth = await getTranslations("auth");

  return (
    <div className="py-16 sm:py-24">
      {/* Navigation */}
      <nav className="mb-16 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-primary">
          Vestya
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {tAuth("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("cta")}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-3xl pb-20 pt-8 text-center">
        <h1 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
          {t("hero")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            {t("cta")}
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-xl border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {tAuth("login")}
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ICONS.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/5 p-3 transition-colors group-hover:bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`features.${key}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
