import "server-only";
import type { Employee } from "@prisma/client";
import { computeDaysElapsed } from "@/lib/progress";

// Which onboarding day (1, 2, 3, ...) "today" is for this employee, based on
// real elapsed calendar time since their start date — not on how many
// check-ins they've completed. This is what ties the day number to an
// actual date: doing the check-in five times in one sitting still only
// ever targets today's day, so it upserts the same row instead of minting
// new "Day 2", "Day 3", ... rows all dated the same day. Returns null once
// the onboarding period is over.
export function getCurrentCheckInDay(
  employee: Pick<Employee, "startDate" | "onboardingDurationDays">
): number | null {
  const day = computeDaysElapsed(employee.startDate) + 1;
  return day <= employee.onboardingDurationDays ? day : null;
}
