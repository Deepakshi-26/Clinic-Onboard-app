import type { Employee } from "@prisma/client";

export function computeGoalsProgress(goals: { done: boolean }[]) {
  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

// Shared by the HR Dashboard, HR Employees list/detail, and Employee Home so
// "overall progress" always means the same thing everywhere it's shown.
export function computeOverallProgress(
  employee: Pick<Employee, "trainingProgressPct">,
  goals: { done: boolean }[]
): number {
  const { pct: goalsPct } = computeGoalsProgress(goals);
  return Math.round((goalsPct + employee.trainingProgressPct) / 2);
}

type DocsCheckEmployee = Pick<
  Employee,
  | "dateOfBirth"
  | "residentialAddress"
  | "phone"
  | "personalEmail"
  | "sinNumberEnc"
  | "healthCardNumberEnc"
  | "permitNumberEnc"
  | "voidChequeUploaded"
>;

export type DocumentItem = { labelKey: string; done: boolean };

// The "Documents" checklist is computed from Employee field presence, not a
// separate documents table — see prisma/schema.prisma's Employee model notes.
export function computeDocumentItems(employee: DocsCheckEmployee): DocumentItem[] {
  return [
    { labelKey: "docs.dateOfBirth", done: !!employee.dateOfBirth },
    { labelKey: "docs.homeAddress", done: !!employee.residentialAddress },
    {
      labelKey: "docs.phoneEmail",
      done: !!employee.phone && !!employee.personalEmail,
    },
    { labelKey: "docs.voidCheque", done: employee.voidChequeUploaded },
    { labelKey: "docs.healthCard", done: !!employee.healthCardNumberEnc },
    { labelKey: "docs.sinNumber", done: !!employee.sinNumberEnc },
    { labelKey: "docs.permitNumber", done: !!employee.permitNumberEnc },
  ];
}

export function computeMissingDocs(employee: DocsCheckEmployee): DocumentItem[] {
  return computeDocumentItems(employee).filter((d) => !d.done);
}

export function daysAgoDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// The clinic operates in Quebec (Eastern Time), but the server's clock runs
// in UTC — several hours ahead. Counting elapsed days from raw millisecond
// math means the day count silently advances a day early every evening,
// the moment UTC's calendar date turns over even though it's still
// "today" in Quebec. Compare clinic-local calendar dates instead.
const CLINIC_TIMEZONE = "America/Toronto"; // Eastern Time — same rules as Montreal/Quebec

function toClinicCalendarDate(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00Z`);
}

export function computeDaysElapsed(startDate: Date): number {
  // startDate comes from a plain "YYYY-MM-DD" form field, stored as UTC
  // midnight — its UTC calendar-date fields are exactly what was typed, so
  // pull those back out rather than re-interpreting the instant through
  // another timezone (which would shift it by the UTC offset instead).
  const start = new Date(startDate);
  const startDateOnly = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  );
  const ms = toClinicCalendarDate(new Date()).getTime() - startDateOnly.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function computeDaysRemaining(startDate: Date, durationDays: number): number {
  return Math.max(0, durationDays - computeDaysElapsed(startDate));
}

export function computeDeadline(startDate: Date, durationDays: number): Date {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + durationDays);
  return deadline;
}

export function computeWeekNumber(startDate: Date): number {
  return Math.floor(computeDaysElapsed(startDate) / 7) + 1;
}

export type StepStatus = "done" | "active" | "pending";
export type Step = { labelKey: string; status: StepStatus };

type StepEmployee = DocsCheckEmployee &
  Pick<Employee, "trainingProgressPct" | "status">;

export function computeOnboardingSteps(
  employee: StepEmployee,
  goals: { done: boolean }[]
): Step[] {
  const { pct: goalsPct } = computeGoalsProgress(goals);
  const personalInfoDone =
    !!employee.dateOfBirth && !!employee.phone && !!employee.residentialAddress;
  const documentsDone = computeMissingDocs(employee).length === 0;
  const trainingDone = employee.trainingProgressPct >= 100;
  const goalsDone = goals.length > 0 && goalsPct === 100;
  const complete = employee.status === "COMPLETED";

  const doneFlags = [true, personalInfoDone, documentsDone, trainingDone, goalsDone, complete];
  const labelKeys = [
    "steps.accountSetup",
    "steps.personalInfo",
    "steps.documents",
    "steps.training",
    "steps.goalsReview",
    "steps.complete",
  ];

  const firstNotDone = doneFlags.findIndex((done) => !done);

  return labelKeys.map((labelKey, i) => ({
    labelKey,
    status:
      firstNotDone === -1 || i < firstNotDone
        ? "done"
        : i === firstNotDone
          ? "active"
          : "pending",
  }));
}

export function formatShortDate(date: Date, locale: "en" | "fr" = "en"): string {
  return new Date(date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatScheduleDate(date: Date, locale: "en" | "fr" = "en"): string {
  return new Date(date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
