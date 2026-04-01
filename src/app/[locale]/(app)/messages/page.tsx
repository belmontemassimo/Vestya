import { requireFamilyAuth } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import { ChatPage } from "@/components/messages/chat-page";

export default async function MessagesPage() {
  await requireFamilyAuth();
  const t = await getTranslations("messages");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
      <ChatPage />
    </div>
  );
}
