-- CreateTable
CREATE TABLE "IncidentLog" (
    "id" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "reportedByEmail" TEXT NOT NULL,
    "whatHappened" TEXT NOT NULL,
    "whoAffected" TEXT,
    "actionsTaken" TEXT,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncidentLog" ADD CONSTRAINT "IncidentLog_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
