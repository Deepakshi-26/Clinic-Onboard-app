-- CreateTable
CREATE TABLE "AccessCredential" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "location" "Location" NOT NULL,
    "workEmail" TEXT,
    "doorPasscodeEnc" TEXT,
    "buildingPasscodeEnc" TEXT,
    "wifiPasswordEnc" TEXT,
    "medexaPasswordEnc" TEXT,
    "mylePasswordEnc" TEXT,
    "equipmentBoxLocation" TEXT,
    "equipmentRequestEmail" TEXT,
    "trainerName" TEXT,
    "parkingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "parkingNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccessCredential_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "AccessCredential_employeeId_location_key" ON "AccessCredential"("employeeId", "location");
-- AddForeignKey
ALTER TABLE "AccessCredential" ADD CONSTRAINT "AccessCredential_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

