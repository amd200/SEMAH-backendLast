-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_serviceItemId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "serviceItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "ServiceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
