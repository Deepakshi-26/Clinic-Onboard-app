import "server-only";
import { prisma } from "@/lib/db";
import { decryptField, encryptField } from "@/lib/encryption";

export async function getEmployeeSensitiveInfo(employeeId: string) {
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  });
  return {
    ...employee,
    sinNumber: employee.sinNumberEnc ? decryptField(employee.sinNumberEnc) : null,
    healthCardNumber: employee.healthCardNumberEnc
      ? decryptField(employee.healthCardNumberEnc)
      : null,
    permitNumber: employee.permitNumberEnc
      ? decryptField(employee.permitNumberEnc)
      : null,
  };
}

type SensitiveFieldUpdate = {
  sinNumber?: string;
  healthCardNumber?: string;
  permitNumber?: string;
};

export async function updateEmployeeSensitiveInfo(
  employeeId: string,
  data: SensitiveFieldUpdate
) {
  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(data.sinNumber !== undefined && {
        sinNumberEnc: data.sinNumber ? encryptField(data.sinNumber) : null,
      }),
      ...(data.healthCardNumber !== undefined && {
        healthCardNumberEnc: data.healthCardNumber
          ? encryptField(data.healthCardNumber)
          : null,
      }),
      ...(data.permitNumber !== undefined && {
        permitNumberEnc: data.permitNumber ? encryptField(data.permitNumber) : null,
      }),
    },
  });
}
