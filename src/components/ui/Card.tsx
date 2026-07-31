export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {title && (
        <h2 className="mb-3.5 text-sm font-bold text-slate-900 dark:text-zinc-50">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
