import "server-only";
import type { Employee } from "@prisma/client";
import { computeDaysElapsed } from "@/lib/progress";

export const CHECKIN_INTERVAL_DAYS = 1;

// Returns the earliest onboarding day (1, 2, 3, ...) that's due but not yet
// completed, capped at the employee's onboarding length. Catches up
// sequentially rather than skipping ahead if they haven't logged in in a
// while, so nothing gets silently missed.
export function getDueCheckInDay(
  employee: Pick<Employee, "startDate" | "onboardingDurationDays">,
  completedDayOffsets: number[]
): number | null {
  const daysElapsed = computeDaysElapsed(employee.startDate);
  const completed = new Set(completedDayOffsets);

  for (
    let day = CHECKIN_INTERVAL_DAYS;
    day <= employee.onboardingDurationDays;
    day += CHECKIN_INTERVAL_DAYS
  ) {
    if (daysElapsed >= day && !completed.has(day)) {
      return day;
    }
  }
  return null;
}

// Same as getDueCheckInDay but ignores the elapsed-time gate — only reachable
// via the explicit ?test=1 URL param (not linked anywhere in the UI), so HR
// can try the feature without waiting for a real employee's schedule to
// catch up.
export function getNextIncompleteCheckInDay(
  employee: Pick<Employee, "onboardingDurationDays">,
  completedDayOffsets: number[]
): number | null {
  const completed = new Set(completedDayOffsets);
  for (
    let day = CHECKIN_INTERVAL_DAYS;
    day <= employee.onboardingDurationDays;
    day += CHECKIN_INTERVAL_DAYS
  ) {
    if (!completed.has(day)) return day;
  }
  return null;
}
