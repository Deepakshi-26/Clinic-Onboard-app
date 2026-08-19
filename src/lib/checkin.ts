import "server-only";
import type { Employee } from "@prisma/client";

export const CHECKIN_INTERVAL_DAYS = 1;

// Returns the earliest onboarding day (1, 2, 3, ...) that hasn't been
// completed yet, capped at the employee's onboarding length, or null once
// every day is done. Check-ins are available any time — not gated by
// elapsed calendar time — so a new hire can always start one, on day one or
// any day after.
export function getNextCheckInDay(
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
