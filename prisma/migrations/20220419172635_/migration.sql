/*
  Warnings:

  - You are about to alter the column `count` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "count" SET DEFAULT 0,
ALTER COLUMN "count" SET DATA TYPE INTEGER;
