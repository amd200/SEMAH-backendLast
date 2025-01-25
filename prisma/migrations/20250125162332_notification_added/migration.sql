-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_employeeId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "clientId" DROP NOT NULL,
ALTER COLUMN "employeeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
