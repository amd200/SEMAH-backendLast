-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'CLIENT');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';
