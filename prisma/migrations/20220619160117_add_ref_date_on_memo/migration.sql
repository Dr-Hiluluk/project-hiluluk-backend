/*
  Warnings:

  - Added the required column `refDate` to the `Memo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Memo" ADD COLUMN     "refDate" TEXT NOT NULL;
