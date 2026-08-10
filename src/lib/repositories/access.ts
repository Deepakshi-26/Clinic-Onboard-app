import "server-only";
import { prisma } from "@/lib/db";
import { decryptField, encryptField } from "@/lib/encryption";
import type { Location } from "@prisma/client";

export async function getAccessCredential(employeeId: string, location: Location) {
  const cred = await prisma.accessCredential.findUnique({
    where: { employeeId_location: { employeeId, location } },
  });
  if (!cred) return null;

  return {
    ...cred,
    doorPasscode: cred.doorPasscodeEnc ? decryptField(cred.doorPasscodeEnc) : null,
    buildingPasscode: cred.buildingPasscodeEnc
      ? decryptField(cred.buildingPasscodeEnc)
      : null,
    wifiPassword: cred.wifiPasswordEnc ? decryptField(cred.wifiPasswordEnc) : null,
    medexaPassword: cred.medexaPasswordEnc
      ? decryptField(cred.medexaPasswordEnc)
      : null,
    mylePassword: cred.mylePasswordEnc ? decryptField(cred.mylePasswordEnc) : null,
  };
}

type CredentialFields = {
  workEmail?: string;
  doorPasscode?: string;
  buildingPasscode?: string;
  wifiPassword?: string;
  medexaUsername?: string;
  medexaPassword?: string;
  medexaLink?: string;
  myleUsername?: string;
  mylePassword?: string;
  myleLink?: string;
  equipmentBoxLocation?: string;
  equipmentRequestEmail?: string;
  trainerName?: string;
  parkingEnabled?: boolean;
  parkingNote?: string;
};

export async function upsertAccessCredential(
  employeeId: string,
  location: Location,
  data: CredentialFields
) {
  const encrypted = {
    workEmail: data.workEmail || null,
    doorPasscodeEnc: data.doorPasscode ? encryptField(data.doorPasscode) : null,
    buildingPasscodeEnc: data.buildingPasscode
      ? encryptField(data.buildingPasscode)
      : null,
    wifiPasswordEnc: data.wifiPassword ? encryptField(data.wifiPassword) : null,
    medexaUsername: data.medexaUsername || null,
    medexaPasswordEnc: data.medexaPassword ? encryptField(data.medexaPassword) : null,
    medexaLink: data.medexaLink || null,
    myleUsername: data.myleUsername || null,
    mylePasswordEnc: data.mylePassword ? encryptField(data.mylePassword) : null,
    myleLink: data.myleLink || null,
    equipmentBoxLocation: data.equipmentBoxLocation || null,
    equipmentRequestEmail: data.equipmentRequestEmail || null,
    trainerName: data.trainerName || null,
    parkingEnabled: data.parkingEnabled ?? false,
    parkingNote: data.parkingNote || null,
  };

  return prisma.accessCredential.upsert({
    where: { employeeId_location: { employeeId, location } },
    create: { employeeId, location, ...encrypted },
    update: encrypted,
  });
}
