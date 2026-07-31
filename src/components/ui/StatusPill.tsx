type Tone = "green" | "amber" | "red" | "blue";

const TONE_CLASSES: Record<Tone, string> = {
  green:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  blue: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
};

export function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
