import Image from "next/image";
import Link from "next/link";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { NetworkBackground } from "@/components/auth/NetworkBackground";
import { LanguageToggle } from "@/components/shell/LanguageToggle";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 text-lg">
        🏥
      </div>
      <div className={`font-serif text-xl ${light ? "text-white" : "text-slate-900 dark:text-zinc-50"}`}>
        Clinic<span className="text-teal-400">Board</span>
      </div>
    </div>
  );
}

export async function LandingPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const problems = [
    { icon: "⏱", title: t("landing.problem1Title"), body: t("landing.problem1Body") },
    { icon: "🤝", title: t("landing.problem2Title"), body: t("landing.problem2Body") },
    { icon: "📊", title: t("landing.problem3Title"), body: t("landing.problem3Body") },
  ];

  const solutions = [
    { title: t("landing.solution1Title"), body: t("landing.solution1Body") },
    { title: t("landing.solution2Title"), body: t("landing.solution2Body") },
    { title: t("landing.solution3Title"), body: t("landing.solution3Body") },
  ];

  const stats = [
    { big: t("landing.costStat1Big"), label: t("landing.costStat1Label"), src: t("landing.costStat1Src") },
    { big: t("landing.costStat2Big"), label: t("landing.costStat2Label"), src: t("landing.costStat2Src") },
    { big: t("landing.costStat3Big"), label: t("landing.costStat3Label"), src: t("landing.costStat3Src") },
    { big: t("landing.costStat4Big"), label: t("landing.costStat4Label"), src: t("landing.costStat4Src") },
  ];

  const wowPoints = [
    { icon: "🧠", title: t("landing.wow1Title"), body: t("landing.wow1Body") },
    { icon: "🎙️", title: t("landing.wow2Title"), body: t("landing.wow2Body") },
    { icon: "📞", title: t("landing.wow3Title"), body: t("landing.wow3Body") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo light />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-white/80 hover:text-white sm:inline-block"
            >
              {t("landing.navLogin")}
            </Link>
            <Link
              href="/waitlist"
              className="rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t("landing.navWaitlist")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-teal-800">
        <NetworkBackground />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 py-24 text-center sm:py-32">
          <span className="mb-6 rounded-full border border-teal-400/40 bg-teal-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-300">
            {t("landing.heroBadge")}
          </span>
          <h1 className="mb-5 font-serif text-4xl leading-tight font-bold text-white sm:text-5xl md:text-6xl">
            {t("landing.heroHeadline")}
          </h1>
          <p className="mb-9 max-w-2xl text-base leading-relaxed text-teal-100/80 sm:text-lg">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="rounded-full bg-gradient-to-br from-teal-500 to-teal-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
            >
              {t("landing.heroCtaPrimary")}
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("landing.heroCtaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 text-xs font-bold tracking-widest text-teal-600">{t("landing.problemEyebrow")}</div>
          <h2 className="mb-4 font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-zinc-50">
            {t("landing.problemHeadline")}
          </h2>
          <p className="text-sm text-slate-500 sm:text-base dark:text-zinc-400">{t("landing.problemSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-2xl dark:bg-teal-950/40">
                {p.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-zinc-50">{p.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-slate-50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:py-28">
          <div className="mb-14 text-center">
            <div className="mb-3 text-xs font-bold tracking-widest text-teal-600">{t("landing.solutionEyebrow")}</div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-zinc-50">
              {t("landing.solutionHeadline")}
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800">
            {solutions.map((s) => (
              <div key={s.title} className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[1fr_2fr] sm:gap-8">
                <h3 className="text-base font-bold text-teal-600">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real cost */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mb-14 text-center">
            <div className="mb-3 text-xs font-bold tracking-widest text-teal-400">{t("landing.costEyebrow")}</div>
            <h2 className="mb-3 font-serif text-2xl font-bold text-white sm:text-3xl">{t("landing.costHeadline")}</h2>
            <p className="text-sm text-slate-400 italic">{t("landing.costSubtitle")}</p>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <div className="mb-2 font-serif text-2xl font-bold text-teal-400">{s.big}</div>
                <div className="mb-2 text-[11px] leading-snug text-slate-200">{s.label}</div>
                <div className="text-[10px] text-slate-500 italic">{s.src}</div>
              </div>
            ))}
          </div>
          <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-teal-500/40 bg-teal-500/10 px-6 py-4 text-center sm:text-left">
            <span className="font-bold text-teal-300">{t("landing.costCallout")}</span>{" "}
            <span className="text-sm text-slate-300">{t("landing.costCalloutSub")}</span>
          </div>
          <p className="mx-auto max-w-2xl text-center text-sm text-white italic">{t("landing.costClosing")}</p>
        </div>
      </section>

      {/* Product demo */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 text-xs font-bold tracking-widest text-teal-600">{t("landing.demoEyebrow")}</div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-zinc-50">
            {t("landing.demoHeadline")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-xs font-bold tracking-wide text-teal-600">{t("landing.demoHrLabel")}</div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-zinc-800">
              <Image
                src="/images/landing-hr-view.png"
                alt="ClinicBoard HR dashboard"
                width={2880}
                height={1800}
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">{t("landing.demoHrCaption")}</p>
          </div>
          <div>
            <div className="mb-3 text-xs font-bold tracking-wide text-teal-600">{t("landing.demoEmployeeLabel")}</div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-zinc-800">
              <Image
                src="/images/landing-employee-view.png"
                alt="ClinicBoard new employee home"
                width={2880}
                height={1800}
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">{t("landing.demoEmployeeCaption")}</p>
          </div>
        </div>
      </section>

      {/* Wow factor */}
      <section className="bg-slate-50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-xs font-bold tracking-widest text-teal-600">{t("landing.wowEyebrow")}</div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-zinc-50">
              {t("landing.wowHeadline")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {wowPoints.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-2xl dark:bg-teal-950/40">
                  {w.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-zinc-50">{w.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-teal-800">
        <NetworkBackground />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center sm:py-24">
          <h2 className="mb-4 font-serif text-2xl font-bold text-white sm:text-3xl">{t("landing.ctaHeadline")}</h2>
          <p className="mb-8 text-sm text-teal-100/80 sm:text-base">{t("landing.ctaSubtitle")}</p>
          <Link
            href="/waitlist"
            className="rounded-full bg-gradient-to-br from-teal-500 to-teal-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
          >
            {t("landing.ctaButton")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Logo />
          <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-zinc-500">
            <span>{t("landing.footerTagline")}</span>
            <Link href="/privacy" className="hover:text-teal-600">
              {t("login.privacyPolicy")}
            </Link>
            <span>© {new Date().getFullYear()} ClinicBoard. {t("landing.footerRights")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
