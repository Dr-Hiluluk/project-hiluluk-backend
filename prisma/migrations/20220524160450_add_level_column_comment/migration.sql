-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "thumbnail" DROP DEFAULT;
