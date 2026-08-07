-- AlterEnum
ALTER TYPE "EmployeeStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "inactiveAt" TIMESTAMP(3);

