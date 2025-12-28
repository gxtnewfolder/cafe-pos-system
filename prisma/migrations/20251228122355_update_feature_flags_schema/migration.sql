/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `feature_flags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");
