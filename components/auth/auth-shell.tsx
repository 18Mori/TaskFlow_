import Link from "next/link";
import type { ReactNode } from "react";
import { AppLogo } from "@/components/ui/AppLogo";

export interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(39,39,42,0.55),#09090b_58%)]" />
        <div className="bg-grid absolute inset-x-0 top-0 h-[520px]" />
      </div>

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2.5 text-zinc-200 transition-colors duration-150 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-sm"
      >
        <AppLogo size={24} />
        <span className="text-base font-semibold tracking-tight">Taskflow</span>
      </Link>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>
      </div>
    </div>
  );
}