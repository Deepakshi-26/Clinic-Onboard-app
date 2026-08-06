"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LOCATION_LABELS } from "@/lib/labels";

export function LocationTabs({
  basePath,
  activeLocation,
  extraParams = {},
}: {
  basePath: string;
  activeLocation: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(location: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", location);
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {Object.entries(LOCATION_LABELS).map(([value, label]) => (
        <button
          key={value}
          onClick={() => go(value)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeLocation === value
              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
              : "border-slate-300 text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          📍 {label}
        </button>
      ))}
    </div>
  );
}
