"use client";

import { useState, useTransition } from "react";
import { addScheduleItem, removeScheduleItem } from "@/app/hr/schedule/actions";
import { formatScheduleDate } from "@/lib/progress";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ScheduleItem } from "@prisma/client";

const inputClasses =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function SchedulePanel({
  employeeId,
  items,
}: {
  employeeId: string;
  items: ScheduleItem[];
}) {
  const { t, locale } = useLocale();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const sorted = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  function handleAdd() {
    if (!date || !title.trim()) return;
    const formData = new FormData();
    formData.set("employeeId", employeeId);
    formData.set("date", date);
    formData.set("time", time.trim());
    formData.set("title", title.trim());
    formData.set("notes", notes.trim());
    startTransition(async () => {
      await addScheduleItem(formData);
      setDate("");
      setTime("");
      setTitle("");
      setNotes("");
    });
  }

  return (
    <div>
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
        {sorted.length === 0 ? (
          <p className="py-3 text-xs text-slate-500 dark:text-zinc-400">
            {t("schedule.empty")}
          </p>
        ) : (
          sorted.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 py-2.5">
              <div className="w-24 flex-shrink-0 pt-0.5 text-[11px] font-semibold text-teal-600">
                {formatScheduleDate(item.date, locale)}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-900 dark:text-zinc-50">
                  {item.time && (
                    <span className="mr-1.5 text-slate-400 dark:text-zinc-500">
                      {item.time}
                    </span>
                  )}
                  {item.title}
                </div>
                {item.notes && (
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    {item.notes}
                  </div>
                )}
              </div>
              <button
                onClick={() => startTransition(() => removeScheduleItem(item.id))}
                disabled={isPending}
                className="text-[11px] text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                {t("common.remove")}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClasses}
          aria-label={t("schedule.date")}
        />
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder={t("schedule.time")}
          className={inputClasses}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("schedule.titlePlaceholder")}
          className={`${inputClasses} col-span-2`}
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("schedule.notes")}
          className={`${inputClasses} col-span-2`}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !date || !title.trim()}
          className="col-span-2 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("goalsSetup.add")}
        </button>
      </div>
    </div>
  );
}
