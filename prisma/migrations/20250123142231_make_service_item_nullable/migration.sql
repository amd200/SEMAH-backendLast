-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_serviceItemId_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "serviceItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "ServiceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
