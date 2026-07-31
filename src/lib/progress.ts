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

export type DocumentItem = { label: string; done: boolean };

// The "Documents" checklist is computed from Employee field presence, not a
// separate documents table — see prisma/schema.prisma's Employee model notes.
export function computeDocumentItems(employee: DocsCheckEmployee): DocumentItem[] {
  return [
    { label: "Date of Birth", done: !!employee.dateOfBirth },
    { label: "Home Address", done: !!employee.residentialAddress },
    {
      label: "Phone & Email",
      done: !!employee.phone && !!employee.personalEmail,
    },
    { label: "Void Cheque", done: employee.voidChequeUploaded },
    { label: "Health Card", done: !!employee.healthCardNumberEnc },
    { label: "SIN Number", done: !!employee.sinNumberEnc },
    { label: "Permit Number", done: !!employee.permitNumberEnc },
  ];
}

export function computeMissingDocs(employee: DocsCheckEmployee): DocumentItem[] {
  return computeDocumentItems(employee).filter((d) => !d.done);
}

export function daysAgoDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function computeDaysElapsed(startDate: Date): number {
  const ms = Date.now() - new Date(startDate).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function computeDaysRemaining(startDate: Date, durationDays: number): number {
  return Math.max(0, durationDays - computeDaysElapsed(startDate));
}

export function computeDeadline(startDate: Date, durationDays: number): Date {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + durationDays);
  return deadline;
}

export function computePhaseLabel(startDate: Date): string {
  const week = Math.floor(computeDaysElapsed(startDate) / 7) + 1;
  return `Week ${week}`;
}

export type StepStatus = "done" | "active" | "pending";
export type Step = { label: string; status: StepStatus };

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
  const labels = [
    "Account Setup",
    "Personal Info",
    "Documents",
    "Training",
    "Goals Review",
    "Complete",
  ];

  const firstNotDone = doneFlags.findIndex((done) => !done);

  return labels.map((label, i) => ({
    label,
    status:
      firstNotDone === -1 || i < firstNotDone
        ? "done"
        : i === firstNotDone
          ? "active"
          : "pending",
  }));
}

export function formatShortDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
