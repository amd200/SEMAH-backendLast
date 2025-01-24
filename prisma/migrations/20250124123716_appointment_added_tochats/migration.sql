-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "appointmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
