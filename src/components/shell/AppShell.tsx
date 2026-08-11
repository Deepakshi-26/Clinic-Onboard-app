"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { IdleLogout } from "./IdleLogout";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { VoiceTourOverlay } from "@/components/shell/VoiceTourOverlay";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type NavItem = { href: string; labelKey: string; icon: string };

const HR_NAV: NavItem[] = [
  { href: "/hr", labelKey: "nav.dashboard", icon: "📊" },
  { href: "/hr/employees", labelKey: "nav.employees", icon: "👥" },
  { href: "/hr/new-hire-info", labelKey: "nav.newHireInfo", icon: "📝" },
  { href: "/hr/documents", labelKey: "nav.documents", icon: "📁" },
  { href: "/hr/access", labelKey: "nav.access", icon: "🔐" },
  { href: "/hr/goals", labelKey: "nav.goals", icon: "🎯" },
  { href: "/hr/schedule", labelKey: "nav.schedule", icon: "🗓️" },
  { href: "/hr/invite", labelKey: "nav.invite", icon: "✉️" },
  { href: "/hr/messages", labelKey: "nav.messages", icon: "💬" },
  { href: "/hr/inactive", labelKey: "nav.inactive", icon: "⏸️" },
  { href: "/hr/audit-log", labelKey: "nav.auditLog", icon: "🛡️" },
];

const EMPLOYEE_NAV: NavItem[] = [
  { href: "/employee", labelKey: "nav.home", icon: "🏠" },
  { href: "/employee/documents", labelKey: "nav.myDocuments", icon: "📋" },
  { href: "/employee/training", labelKey: "nav.training", icon: "📚" },
  { href: "/employee/access", labelKey: "nav.accessInfo", icon: "🔑" },
  { href: "/employee/schedule", labelKey: "nav.mySchedule", icon: "🗓️" },
  { href: "/employee/messages", labelKey: "nav.messages", icon: "💬" },
];

const TITLE_KEYS: Record<string, string> = {
  "/hr": "nav.dashboard",
  "/hr/employees": "nav.employees",
  "/hr/new-hire-info": "nav.newHireInfo",
  "/hr/documents": "nav.documents",
  "/hr/access": "nav.access",
  "/hr/goals": "nav.goals",
  "/hr/schedule": "nav.schedule",
  "/hr/invite": "nav.invite",
  "/hr/messages": "nav.messages",
  "/hr/inactive": "nav.inactive",
  "/hr/audit-log": "nav.auditLog",
  "/employee": "shell.myOnboarding",
  "/employee/check-in": "checkin.pageTitle",
  "/employee/documents": "nav.myDocuments",
  "/employee/training": "nav.training",
  "/employee/access": "nav.accessInfo",
  "/employee/schedule": "nav.mySchedule",
  "/employee/messages": "nav.messages",
};

export function AppShell({
  role,
  userLabel,
  userSubLabel,
  children,
}: {
  role: "HR" | "EMPLOYEE";
  userLabel: string;
  userSubLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = role === "HR" ? HR_NAV : EMPLOYEE_NAV;
  const title = TITLE_KEYS[pathname] ? t(TITLE_KEYS[pathname]) : "";

  const shell = (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col overflow-y-auto bg-slate-900 text-white transition-transform duration-200 md:relative md:z-auto md:w-60 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 text-base">
              🏥
            </div>
            <div className="font-serif text-lg">
              Clinic<span className="text-teal-400">Board</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold">{userLabel}</div>
          <div className="mt-0.5 text-xs text-white/40">{userSubLabel}</div>
        </div>

        <nav className="flex-1 px-1.5 py-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-4 text-center text-sm">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3.5">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 hover:border-teal-600 hover:text-teal-600 md:hidden dark:border-zinc-700 dark:text-zinc-300"
            >
              ☰
            </button>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-50">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3.5 sm:p-6 dark:bg-zinc-950">
          {children}
        </main>
      </div>

      <Chatbot role={role} />
      <IdleLogout />
    </div>
  );

  return role === "EMPLOYEE" ? <VoiceTourOverlay>{shell}</VoiceTourOverlay> : shell;
}
