"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import { Chatbot } from "@/components/chatbot/Chatbot";

type NavItem = { href: string; label: string; icon: string };

const HR_NAV: NavItem[] = [
  { href: "/hr", label: "Dashboard", icon: "📊" },
  { href: "/hr/employees", label: "Employees", icon: "👥" },
  { href: "/hr/new-hire-info", label: "New Hire Info", icon: "📝" },
  { href: "/hr/invite", label: "Invite New Hire", icon: "✉️" },
];

const EMPLOYEE_NAV: NavItem[] = [{ href: "/employee", label: "Home", icon: "🏠" }];

const TITLES: Record<string, string> = {
  "/hr": "Dashboard",
  "/hr/employees": "Employees",
  "/hr/new-hire-info": "New Hire Info",
  "/hr/invite": "Invite New Hire",
  "/employee": "My Onboarding",
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
  const nav = role === "HR" ? HR_NAV : EMPLOYEE_NAV;
  const title = TITLES[pathname] ?? "";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 flex-shrink-0 flex-col overflow-y-auto bg-slate-900 text-white">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 text-base">
              🏥
            </div>
            <div className="font-serif text-lg">
              Clinic<span className="text-teal-400">Board</span>
            </div>
          </div>
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
                className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-4 text-center text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3.5">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center border-b border-slate-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-base font-bold text-slate-900 dark:text-zinc-50">
            {title}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-zinc-950">
          {children}
        </main>
      </div>

      <Chatbot role={role} />
    </div>
  );
}
