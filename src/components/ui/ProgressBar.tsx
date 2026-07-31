export function ProgressBar({
  pct,
  color = "#0D7377",
  className = "",
}: {
  pct: number;
  color?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800 ${className}`}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
