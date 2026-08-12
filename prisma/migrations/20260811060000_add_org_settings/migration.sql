-- CreateTable
CREATE TABLE "OrgSettings" (
    "id" TEXT NOT NULL,
    "clinicName" TEXT,
    "privacyOfficerName" TEXT,
    "privacyOfficerEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgSettings_pkey" PRIMARY KEY ("id")
);
