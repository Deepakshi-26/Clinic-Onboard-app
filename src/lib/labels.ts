import type { JobTitle, Location } from "@prisma/client";
import type { Locale } from "./i18n/translations";

const JOB_TITLE_LABELS_EN: Record<JobTitle, string> = {
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

const JOB_TITLE_LABELS_FR: Record<JobTitle, string> = {
  PHYSIOTHERAPIST: "Physiothérapeute",
  OCCUPATIONAL_THERAPIST: "Ergothérapeute",
  PHYSIO_ASSISTANT: "Assistant en physiothérapie",
  OT_ASSISTANT: "Assistant en ergothérapie",
  PHYSIO_TECHNOLOGIST: "Technologue en physiothérapie",
  DOCTOR: "Médecin",
  REHAB_ADMIN: "Admin réadaptation",
  MEDICAL_ADMIN: "Admin médical",
  CNESST_ADMIN: "Admin CNESST",
  SAAQ_ADMIN: "Admin SAAQ",
  BC_ADMIN: "Admin BC",
  HR: "RH",
  MANAGER: "Gestionnaire",
};

const LOCATION_LABELS_EN: Record<Location, string> = {
  PARC_EXTENSION: "Parc Extension",
  MONTREAL_NORD: "Montréal Nord",
  COTE_VERTU: "Côte-Vertu",
  LACHINE: "Lachine",
};

const LOCATION_LABELS_FR: Record<Location, string> = {
  PARC_EXTENSION: "Parc-Extension",
  MONTREAL_NORD: "Montréal-Nord",
  COTE_VERTU: "Côte-Vertu",
  LACHINE: "Lachine",
};

export const JOB_TITLE_LABELS = JOB_TITLE_LABELS_EN;
export const LOCATION_LABELS = LOCATION_LABELS_EN;

export function jobTitleLabels(locale: Locale = "en"): Record<JobTitle, string> {
  return locale === "fr" ? JOB_TITLE_LABELS_FR : JOB_TITLE_LABELS_EN;
}

export function locationLabels(locale: Locale = "en"): Record<Location, string> {
  return locale === "fr" ? LOCATION_LABELS_FR : LOCATION_LABELS_EN;
}

export function titleLabel(title: JobTitle, locale: Locale = "en"): string {
  return jobTitleLabels(locale)[title];
}

export function locationLabel(location: Location, locale: Locale = "en"): string {
  return locationLabels(locale)[location];
}

export type ClinicAddress = { name: string; address: string; phone: string };

// Sourced from the clinic's own contact page. Lachine's isn't in hand yet —
// omitted here on purpose so email templates skip that section gracefully
// rather than showing a placeholder.
export const LOCATION_ADDRESSES: Partial<Record<Location, ClinicAddress>> = {
  PARC_EXTENSION: {
    name: "Clinique Physioversal de Parc-Extension",
    address: "6830 Avenue Du Parc, Suite 100 et 103 RDC, Montréal, Québec H3N 1W7, Canada",
    phone: "514-531-9049",
  },
  COTE_VERTU: {
    name: "Clinique Physioversal de Côte-Vertu",
    address: "1077 Bd Décarie, Suite 2, RDC, Saint-Laurent, Québec H4L 3M8, Canada",
    phone: "(514) 447-9221",
  },
  MONTREAL_NORD: {
    name: "Clinique Physioversal de Montréal-Nord",
    address: "5879 Boulevard Henri-Bourassa Est, Local 307, 3e étage, Montréal-Nord, Québec H1G 2V1, Canada",
    phone: "(514) 258-0343",
  },
};

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
