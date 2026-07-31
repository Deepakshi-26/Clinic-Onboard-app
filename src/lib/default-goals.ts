export type DefaultGoal = {
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  title: string;
  description: string;
  periodNumber: number;
  order: number;
};

// Shared by the Invite Server Action and the seed script so every new hire
// starts with the same default 30-day goal set (mirrors the prototype).
export const defaultGoalSet: DefaultGoal[] = [
  {
    type: "DAILY",
    title: "Log into MEDEXA and explore the dashboard",
    description: "Familiarize yourself with the main navigation and patient lookup.",
    periodNumber: 1,
    order: 0,
  },
  {
    type: "DAILY",
    title: "Upload void cheque for payroll setup",
    description: "Required for your first pay cycle.",
    periodNumber: 1,
    order: 1,
  },
  {
    type: "DAILY",
    title: "Meet your trainer and review your schedule",
    description: "Introduction call — check your work email for the invite.",
    periodNumber: 2,
    order: 2,
  },
  {
    type: "WEEKLY",
    title: "Submit all required personal documents",
    description: "Health card, SIN, permit number, address, phone, date of birth.",
    periodNumber: 1,
    order: 3,
  },
  {
    type: "WEEKLY",
    title: "Complete Training Booklet — Part 1",
    description: "Covers front desk procedures and scheduling basics.",
    periodNumber: 1,
    order: 4,
  },
  {
    type: "WEEKLY",
    title: "Shadow a full workflow with your trainer",
    description: "Observe an end-to-end patient or billing workflow.",
    periodNumber: 2,
    order: 5,
  },
  {
    type: "MONTHLY",
    title: "Complete full onboarding checklist",
    description: "All documents submitted, all training modules done.",
    periodNumber: 30,
    order: 6,
  },
  {
    type: "MONTHLY",
    title: "30-day check-in with HR",
    description: "Review your onboarding experience and next steps.",
    periodNumber: 30,
    order: 7,
  },
];
