-- CreateTable
CREATE TABLE "Memo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "openType" TEXT NOT NULL DEFAULT E'public',

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
