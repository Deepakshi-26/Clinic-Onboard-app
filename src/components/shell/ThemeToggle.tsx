"use client";

function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000`;
}

export function ThemeToggle() {
  return (
    <button
      onClick={toggleTheme}
      title="Toggle dark / light mode"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 transition-colors hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
