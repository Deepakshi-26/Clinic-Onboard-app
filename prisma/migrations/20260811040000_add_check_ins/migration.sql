-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "transcript" TEXT NOT NULL,
    "summary" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_employeeId_dayOffset_key" ON "CheckIn"("employeeId", "dayOffset");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
