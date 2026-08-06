import type { JobTitle, Location } from "@prisma/client";

export const JOB_TITLE_LABELS: Record<JobTitle, string> = {
  PHYSIOTHERAPIST: "Physiotherapist",
  OCCUPATIONAL_THERAPIST: "Occupational Therapist",
  PHYSIO_ASSISTANT: "Physio Assistant",
  OT_ASSISTANT: "OT Assistant",
  PHYSIO_TECHNOLOGIST: "Physio Technologist",
  DOCTOR: "Doctor",
  REHAB_ADMIN: "Rehab Admin",
  MEDICAL_ADMIN: "Medical Admin",
  CNESST_ADMIN: "CNESST Admin",
  SAAQ_ADMIN: "SAAQ Admin",
  BC_ADMIN: "BC Admin",
  HR: "HR",
  MANAGER: "Manager",
};

export const LOCATION_LABELS: Record<Location, string> = {
  PARC_EXTENSION: "Parc Extension",
  MONTREAL_NORD: "Montréal Nord",
  COTE_VERTU: "Côte-Vertu",
  LACHINE: "Lachine",
};

export function titleLabel(title: JobTitle): string {
  return JOB_TITLE_LABELS[title];
}

export function locationLabel(location: Location): string {
  return LOCATION_LABELS[location];
}

const AVATAR_COLORS = [
  "#6941C6",
  "#0D7377",
  "#2D9E6B",
  "#E89A2B",
  "#1D6FA4",
  "#D94040",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const DOC_TYPES = [
  "MEDEXA Therapist Guide",
  "MEDEXA Admin Guide",
  "Myle Doctor Guide",
  "Myle Admin Guide",
  "CNESST Admin Guide",
  "SAAQ Admin Guide",
  "BC Admin Guide",
  "Clinic Procedure",
  "Evals & Suivis Notes",
  "Physio Documents",
  "Ergo Documents",
  "Exercise Programs",
  "Training Booklet – Rehab Admin",
  "Training Booklet – Medical Admin",
  "Other",
];

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
