/*
  Warnings:

  - You are about to drop the `_CartToCommissioner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartToCommissioner" DROP CONSTRAINT "_CartToCommissioner_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToCommissioner" DROP CONSTRAINT "_CartToCommissioner_B_fkey";

-- DropTable
DROP TABLE "_CartToCommissioner";

-- CreateTable
CREATE TABLE "_CommissionerToOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CommissionerToOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommissionerToOrder_B_index" ON "_CommissionerToOrder"("B");

-- AddForeignKey
ALTER TABLE "_CommissionerToOrder" ADD CONSTRAINT "_CommissionerToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Commissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommissionerToOrder" ADD CONSTRAINT "_CommissionerToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
