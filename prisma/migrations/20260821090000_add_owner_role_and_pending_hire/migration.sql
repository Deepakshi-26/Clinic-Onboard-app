-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OWNER';

-- CreateEnum
CREATE TYPE "PendingHireStatus" AS ENUM ('PENDING', 'CONVERTED', 'DISMISSED');

-- CreateTable
CREATE TABLE "PendingHire" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" "JobTitle" NOT NULL,
    "location" "Location" NOT NULL,
    "personalEmail" TEXT,
    "notes" TEXT,
    "status" "PendingHireStatus" NOT NULL DEFAULT 'PENDING',
    "convertedEmployeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingHire_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingHire" ADD CONSTRAINT "PendingHire_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
