/*
  Warnings:

  - A unique constraint covering the columns `[authid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_authid_key" ON "public"."User"("authid");

-- CreateIndex
CREATE INDEX "User_authid_idx" ON "public"."User"("authid");
