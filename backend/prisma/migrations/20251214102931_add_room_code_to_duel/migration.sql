/*
  Warnings:

  - A unique constraint covering the columns `[room_code]` on the table `duels` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "duels" ADD COLUMN     "room_code" VARCHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "duels_room_code_key" ON "duels"("room_code");
