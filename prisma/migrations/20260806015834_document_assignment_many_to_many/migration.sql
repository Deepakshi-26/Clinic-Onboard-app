-- DropForeignKey
ALTER TABLE "TrainingDocument" DROP CONSTRAINT "TrainingDocument_assignedEmployeeId_fkey";
-- AlterTable
ALTER TABLE "TrainingDocument" DROP COLUMN "assignedEmployeeId";
-- CreateTable
CREATE TABLE "_EmployeeToTrainingDocument" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EmployeeToTrainingDocument_AB_pkey" PRIMARY KEY ("A","B")
);
-- CreateIndex
CREATE INDEX "_EmployeeToTrainingDocument_B_index" ON "_EmployeeToTrainingDocument"("B");
-- AddForeignKey
ALTER TABLE "_EmployeeToTrainingDocument" ADD CONSTRAINT "_EmployeeToTrainingDocument_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_EmployeeToTrainingDocument" ADD CONSTRAINT "_EmployeeToTrainingDocument_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

