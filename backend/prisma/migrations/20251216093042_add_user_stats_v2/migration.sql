-- AlterTable
ALTER TABLE "users" ADD COLUMN     "questions_solved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quizzes_completed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "action_count" INTEGER DEFAULT 1,
    "last_action" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_device_tokens_user" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_activity_date" ON "user_activity"("date");

-- CreateIndex
CREATE INDEX "idx_user_activity_user_date" ON "user_activity"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_activity_user_id_date_key" ON "user_activity"("user_id", "date");
