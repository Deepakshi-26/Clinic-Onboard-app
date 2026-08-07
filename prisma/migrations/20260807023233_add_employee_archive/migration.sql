-- AlterEnum
ALTER TYPE "EmployeeStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "archivedAt" TIMESTAMP(3);

