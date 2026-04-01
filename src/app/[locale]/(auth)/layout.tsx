import { Link } from "@/i18n/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
          Hestia
        </Link>
      </div>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
