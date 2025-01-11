-- CreateTable
CREATE TABLE "Commissioner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "serviceItemId" INTEGER,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commissioner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commissioner" ADD CONSTRAINT "Commissioner_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "ServiceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commissioner" ADD CONSTRAINT "Commissioner_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
