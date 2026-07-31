import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createCipheriv, randomBytes } from "crypto";
import { defaultGoalSet } from "../src/lib/default-goals";

const prisma = new PrismaClient();

// Duplicated (not imported) from src/lib/encryption.ts: that module is guarded
// with `import "server-only"`, which throws when loaded outside Next's server
// build pipeline — including this seed script, run directly via tsx. Keep the
// algorithm identical to src/lib/encryption.ts's decryptField.
function localEncryptField(plaintext: string): string {
  const key = Buffer.from(requireEncryptionKey(), "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(
    ":"
  );
}

function requireEncryptionKey(): string {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate with `openssl rand -hex 32`."
    );
  }
  return hex;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 10);

  await prisma.user.upsert({
    where: { email: "hr@clinic.com" },
    update: {},
    create: {
      email: "hr@clinic.com",
      name: "Sarah Mitchell",
      passwordHash,
      role: "HR",
    },
  });

  const employeeSeeds = [
    {
      email: "maria.s@example.com",
      fullName: "Maria Santos",
      title: "MEDICAL_ADMIN" as const,
      location: "PARC_EXTENSION" as const,
      startedDaysAgo: 9,
      trainerName: "Dr. Leila Nouri",
      phone: "+1 514-555-0192",
      dateOfBirth: new Date("1992-04-15"),
      residentialAddress: "4520 Rue Jarry, Montréal, QC",
      sinNumber: null as string | null,
      healthCardNumber: null as string | null,
      permitNumber: "PR-2024-11029",
      voidChequeUploaded: false,
      trainingProgressPct: 30,
      goalsDoneCount: 3,
    },
    {
      email: "james.p@example.com",
      fullName: "James Patel",
      title: "PHYSIOTHERAPIST" as const,
      location: "MONTREAL_NORD" as const,
      startedDaysAgo: 15,
      trainerName: "Dr. Leila Nouri",
      phone: "+1 514-555-0233",
      dateOfBirth: new Date("1990-11-02"),
      residentialAddress: "120 Rue de Louvain, Montréal, QC",
      sinNumber: "123-456-782",
      healthCardNumber: null,
      permitNumber: "PR-2024-88213",
      voidChequeUploaded: true,
      trainingProgressPct: 55,
      goalsDoneCount: 5,
    },
    {
      email: "alex.c@example.com",
      fullName: "Alex Chen",
      title: "CNESST_ADMIN" as const,
      location: "COTE_VERTU" as const,
      startedDaysAgo: 25,
      trainerName: "Tom Bergeron",
      phone: "+1 514-555-0301",
      dateOfBirth: new Date("1995-02-20"),
      residentialAddress: "875 Boulevard Décarie, Montréal, QC",
      sinNumber: "234-567-891",
      healthCardNumber: "HC-99201-AB",
      permitNumber: "PR-2024-33107",
      voidChequeUploaded: true,
      trainingProgressPct: 75,
      goalsDoneCount: 7,
    },
  ];

  for (const seed of employeeSeeds) {
    const existing = await prisma.user.findUnique({ where: { email: seed.email } });
    if (existing) {
      console.log(`Skipping ${seed.email} — already seeded.`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: seed.email,
        passwordHash,
        role: "EMPLOYEE",
        employee: {
          create: {
            fullName: seed.fullName,
            title: seed.title,
            location: seed.location,
            startDate: daysAgo(seed.startedDaysAgo),
            onboardingDurationDays: 30,
            status: "ACTIVE",
            trainerName: seed.trainerName,
            phone: seed.phone,
            dateOfBirth: seed.dateOfBirth,
            personalEmail: seed.email,
            residentialAddress: seed.residentialAddress,
            sinNumberEnc: seed.sinNumber ? localEncryptField(seed.sinNumber) : null,
            healthCardNumberEnc: seed.healthCardNumber
              ? localEncryptField(seed.healthCardNumber)
              : null,
            permitNumberEnc: seed.permitNumber
              ? localEncryptField(seed.permitNumber)
              : null,
            voidChequeUploaded: seed.voidChequeUploaded,
            trainingProgressPct: seed.trainingProgressPct,
            goals: {
              create: defaultGoalSet.map((goal, index) => ({
                type: goal.type,
                title: goal.title,
                description: goal.description,
                periodNumber: goal.periodNumber,
                order: goal.order,
                done: index < seed.goalsDoneCount,
                doneAt: index < seed.goalsDoneCount ? new Date() : null,
              })),
            },
          },
        },
      },
      include: { employee: true },
    });

    console.log(`Seeded ${seed.fullName} (${user.email}).`);
  }

  console.log("\nSeed login credentials (all use password: changeme123):");
  console.log("  HR:       hr@clinic.com");
  for (const seed of employeeSeeds) {
    console.log(`  Employee: ${seed.email} (${seed.fullName})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
