-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "commissionerId" TEXT;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_commissionerId_fkey" FOREIGN KEY ("commissionerId") REFERENCES "Commissioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
