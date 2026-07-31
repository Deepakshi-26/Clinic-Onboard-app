"use client";

import { useTransition } from "react";
import { toggleGoal } from "@/app/employee/actions";

export function GoalCheck({
  goalId,
  title,
  description,
  done,
}: {
  goalId: string;
  title: string;
  description: string | null;
  done: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-3 py-2.5">
      <button
        onClick={() => startTransition(() => toggleGoal(goalId))}
        disabled={isPending}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 text-[11px] transition-colors ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 dark:border-zinc-600"
        } disabled:opacity-60`}
      >
        {done && "✓"}
      </button>
      <div>
        <div
          className={`text-xs font-medium ${
            done
              ? "text-slate-400 line-through dark:text-zinc-600"
              : "text-slate-900 dark:text-zinc-50"
          }`}
        >
          {title}
        </div>
        {description && (
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
