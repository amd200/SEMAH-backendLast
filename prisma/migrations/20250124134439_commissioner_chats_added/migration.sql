/*
  Warnings:

  - The primary key for the `Commissioner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CommissionerToOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CommissionerToServiceItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_CommissionerToOrder" DROP CONSTRAINT "_CommissionerToOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "_CommissionerToServiceItem" DROP CONSTRAINT "_CommissionerToServiceItem_A_fkey";

-- AlterTable
ALTER TABLE "Commissioner" DROP CONSTRAINT "Commissioner_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Commissioner_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Commissioner_id_seq";

-- AlterTable
ALTER TABLE "_CommissionerToOrder" DROP CONSTRAINT "_CommissionerToOrder_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_CommissionerToOrder_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_CommissionerToServiceItem" DROP CONSTRAINT "_CommissionerToServiceItem_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_CommissionerToServiceItem_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "_CommissionerToServiceItem" ADD CONSTRAINT "_CommissionerToServiceItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Commissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommissionerToOrder" ADD CONSTRAINT "_CommissionerToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Commissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
