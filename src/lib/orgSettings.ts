import "server-only";
import { prisma } from "@/lib/db";

const SINGLETON_ID = "singleton";

export async function getOrgSettings() {
  return prisma.orgSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
}

export async function updateOrgSettings(data: {
  clinicName?: string;
  privacyOfficerName?: string;
  privacyOfficerEmail?: string;
  opsLeadName?: string;
  opsLeadEmail?: string;
}) {
  return prisma.orgSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...data },
    update: data,
  });
}
