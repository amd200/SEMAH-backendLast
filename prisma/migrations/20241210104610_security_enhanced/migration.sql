/*
  Warnings:

  - You are about to drop the column `tokenExpiration` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "tokenExpiration",
DROP COLUMN "verificationToken",
ADD COLUMN     "emailTokenExpiration" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "phoneTokenExpiration" TIMESTAMP(3),
ADD COLUMN     "phoneVerificationToken" TEXT;
