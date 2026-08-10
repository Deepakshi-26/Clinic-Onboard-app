import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { decryptField, encryptField } from "@/lib/encryption";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function getEmployeeSensitiveInfo(employeeId: string) {
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    include: { user: { select: { passwordSetAt: true } } },
  });
  return {
    ...employee,
    passwordSetAt: employee.user.passwordSetAt,
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
  data: SensitiveFieldUpdate,
  client: DbClient = prisma
) {
  return client.employee.update({
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
