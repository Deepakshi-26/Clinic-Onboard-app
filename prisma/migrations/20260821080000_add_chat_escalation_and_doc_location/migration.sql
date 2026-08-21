-- AlterTable
ALTER TABLE "TrainingDocument" ADD COLUMN     "location" "Location";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "escalated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrgSettings" ADD COLUMN     "opsLeadName" TEXT,
ADD COLUMN     "opsLeadEmail" TEXT;
