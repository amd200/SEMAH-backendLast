/*
  Warnings:

  - You are about to drop the column `clientId` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `ServiceItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceItem" DROP CONSTRAINT "ServiceItem_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceItem" DROP CONSTRAINT "ServiceItem_employeeId_fkey";

-- AlterTable
ALTER TABLE "ServiceItem" DROP COLUMN "clientId",
DROP COLUMN "employeeId";

-- CreateTable
CREATE TABLE "_ClientToServiceItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClientToServiceItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EmployeeToServiceItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmployeeToServiceItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClientToServiceItem_B_index" ON "_ClientToServiceItem"("B");

-- CreateIndex
CREATE INDEX "_EmployeeToServiceItem_B_index" ON "_EmployeeToServiceItem"("B");

-- AddForeignKey
ALTER TABLE "_ClientToServiceItem" ADD CONSTRAINT "_ClientToServiceItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToServiceItem" ADD CONSTRAINT "_ClientToServiceItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToServiceItem" ADD CONSTRAINT "_EmployeeToServiceItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToServiceItem" ADD CONSTRAINT "_EmployeeToServiceItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
