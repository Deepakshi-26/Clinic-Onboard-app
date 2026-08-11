"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { NetworkBackground } from "@/components/auth/NetworkBackground";

type Role = "HR" | "EMPLOYEE";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const justSetPassword = searchParams.get("passwordSet") === "1";
  const [role, setRole] = useState<Role>("HR");
  const [email, setEmail] = useState("hr@clinic.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function selectRole(next: Role) {
    setRole(next);
    setEmail(next === "HR" ? "hr@clinic.com" : "maria.s@example.com");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      setError(t("login.invalidCredentials"));
      return;
    }
    router.push(role === "HR" ? "/hr" : "/employee");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-teal-800 px-4">
      <NetworkBackground />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl dark:bg-zinc-900">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 text-xl">
            🏥
          </div>
          <div className="font-serif text-2xl text-slate-900 dark:text-zinc-50">
            Clinic<span className="text-teal-600">Board</span>
          </div>
        </div>
        <p className="mb-7 pl-14 text-sm text-slate-500 dark:text-zinc-400">
          {t("login.subtitle")}
        </p>

        {justSetPassword && (
          <p className="mb-5 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            ✅ {t("login.passwordSetSuccess")}
          </p>
        )}

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => selectRole("HR")}
            className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              role === "HR"
                ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                : "border-slate-200 text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {t("login.roleHr")}
          </button>
          <button
            type="button"
            onClick={() => selectRole("EMPLOYEE")}
            className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              role === "EMPLOYEE"
                ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                : "border-slate-200 text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {t("login.roleEmployee")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
              {t("login.email")}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
              {t("login.password")}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              required
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? t("login.signingIn") : t("login.signIn")}
          </button>
        </form>

        <Link
          href="/privacy"
          className="mt-6 block text-center text-[11px] text-slate-400 hover:text-teal-600 dark:text-zinc-500"
        >
          {t("login.privacyPolicy")}
        </Link>
      </div>
    </div>
  );
}
