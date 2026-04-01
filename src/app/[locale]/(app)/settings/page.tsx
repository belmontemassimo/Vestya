import { redirect } from "next/navigation";
import { requireFamilyAuth } from "@/lib/auth-guard";

interface SettingsPageProps {
  params: { locale: string };
}

export default async function SettingsPage({
  params: { locale },
}: SettingsPageProps) {
  await requireFamilyAuth();
  redirect(`/${locale}/settings/family`);
}
