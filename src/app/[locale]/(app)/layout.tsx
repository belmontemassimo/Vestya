import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";

interface AppLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AppLayout({
  children,
  params: { locale },
}: AppLayoutProps) {
  const session = await requireAuth();

  if (!session.user.familyId) {
    redirect(`/${locale}/onboarding`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-[260px]">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
