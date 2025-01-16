/*
  Warnings:

  - You are about to drop the column `serviceItemId` on the `Commissioner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commissioner" DROP CONSTRAINT "Commissioner_serviceItemId_fkey";

-- AlterTable
ALTER TABLE "Commissioner" DROP COLUMN "serviceItemId";

-- CreateTable
CREATE TABLE "_CommissionerToServiceItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CommissionerToServiceItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CartToCommissioner" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CartToCommissioner_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommissionerToServiceItem_B_index" ON "_CommissionerToServiceItem"("B");

-- CreateIndex
CREATE INDEX "_CartToCommissioner_B_index" ON "_CartToCommissioner"("B");

-- AddForeignKey
ALTER TABLE "_CommissionerToServiceItem" ADD CONSTRAINT "_CommissionerToServiceItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Commissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommissionerToServiceItem" ADD CONSTRAINT "_CommissionerToServiceItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToCommissioner" ADD CONSTRAINT "_CartToCommissioner_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToCommissioner" ADD CONSTRAINT "_CartToCommissioner_B_fkey" FOREIGN KEY ("B") REFERENCES "Commissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
