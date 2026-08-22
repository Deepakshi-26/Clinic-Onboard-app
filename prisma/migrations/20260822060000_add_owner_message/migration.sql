-- CreateTable
CREATE TABLE "OwnerMessage" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "OwnerMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OwnerMessage" ADD CONSTRAINT "OwnerMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
