"use client";

import { useState, useTransition } from "react";
import { addGoal, removeGoal, toggleGoalHr } from "@/app/hr/goals/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Goal, GoalType } from "@prisma/client";

const TABS: {
  type: GoalType;
  labelKey: string;
  periodLabelKey: string;
  placeholderKey: string;
  emptyKey: string;
  icon: string;
}[] = [
  {
    type: "DAILY",
    labelKey: "goalsSetup.dailyGoals",
    periodLabelKey: "goalsSetup.day",
    placeholderKey: "goalsSetup.addDailyPlaceholder",
    emptyKey: "goalsSetup.noDailyYet",
    icon: "📅",
  },
  {
    type: "WEEKLY",
    labelKey: "goalsSetup.weeklyGoals",
    periodLabelKey: "common.week",
    placeholderKey: "goalsSetup.addWeeklyPlaceholder",
    emptyKey: "goalsSetup.noWeeklyYet",
    icon: "📆",
  },
  {
    type: "MONTHLY",
    labelKey: "goalsSetup.monthlyGoals",
    periodLabelKey: "goalsSetup.day",
    placeholderKey: "goalsSetup.addMonthlyPlaceholder",
    emptyKey: "goalsSetup.noMonthlyYet",
    icon: "🗓",
  },
];

const inputClasses =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function GoalsSetupPanel({
  employeeId,
  goals,
}: {
  employeeId: string;
  goals: Goal[];
}) {
  const { t } = useLocale();
  const [activeType, setActiveType] = useState<GoalType>("DAILY");
  const [title, setTitle] = useState("");
  const [periodNumber, setPeriodNumber] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeGoals = goals
    .filter((g) => g.type === activeType)
    .sort((a, b) => a.order - b.order);

  const activeTab = TABS.find((tab) => tab.type === activeType)!;

  function handleAdd() {
    if (!title.trim() || !periodNumber) return;
    const formData = new FormData();
    formData.set("employeeId", employeeId);
    formData.set("type", activeType);
    formData.set("title", title.trim());
    formData.set("periodNumber", periodNumber);
    startTransition(async () => {
      await addGoal(formData);
      setTitle("");
      setPeriodNumber("");
    });
  }

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-zinc-900">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveType(tab.type)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
              activeType === tab.type
                ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            {tab.icon} {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
        {activeGoals.length === 0 ? (
          <p className="py-3 text-xs text-slate-500 dark:text-zinc-400">
            {t(activeTab.emptyKey)}
          </p>
        ) : (
          activeGoals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-2.5 py-2.5">
              <button
                onClick={() => startTransition(() => toggleGoalHr(goal.id))}
                disabled={isPending}
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] transition-colors disabled:opacity-50 ${
                  goal.done
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-slate-300 dark:border-zinc-600"
                }`}
              >
                {goal.done && "✓"}
              </button>
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-900 dark:text-zinc-50">
                  {goal.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {t(activeTab.periodLabelKey)} {goal.periodNumber}
                </div>
              </div>
              <button
                onClick={() => startTransition(() => removeGoal(goal.id))}
                disabled={isPending}
                className="text-[11px] text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                {t("common.remove")}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3.5 flex gap-1.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t(activeTab.placeholderKey)}
          className={`${inputClasses} flex-1`}
        />
        <input
          value={periodNumber}
          onChange={(e) => setPeriodNumber(e.target.value)}
          placeholder={t(activeTab.periodLabelKey)}
          type="number"
          min={1}
          className={`${inputClasses} w-20`}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !title.trim() || !periodNumber}
          className="rounded-lg bg-teal-600 px-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("goalsSetup.add")}
        </button>
      </div>
    </div>
  );
}
