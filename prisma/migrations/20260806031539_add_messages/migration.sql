-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('HR_EMPLOYEE', 'PEER');
-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "employeeId" TEXT NOT NULL,
    "peerEmployeeId" TEXT,
    "senderRole" "UserRole" NOT NULL,
    "senderEmployeeId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "Message_channel_employeeId_idx" ON "Message"("channel", "employeeId");
-- CreateIndex
CREATE INDEX "Message_channel_peerEmployeeId_idx" ON "Message"("channel", "peerEmployeeId");
-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_peerEmployeeId_fkey" FOREIGN KEY ("peerEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderEmployeeId_fkey" FOREIGN KEY ("senderEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

