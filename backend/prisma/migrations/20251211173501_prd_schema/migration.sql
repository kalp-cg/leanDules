/*
  Warnings:

  - You are about to drop the column `selected_opt` on the `duel_answers` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `correct_option` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_a` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_b` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_c` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_d` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `difficulties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leaderboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[duel_id,question_id]` on the table `duel_questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challenge_id]` on the table `duels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `selected_answer` to the `duel_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_taken` to the `duel_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_index` to the `duel_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `duels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct_answer` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `options` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leaderboard" DROP CONSTRAINT "leaderboard_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_category_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_difficulty_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_user_id_fkey";

-- AlterTable
ALTER TABLE "duel_answers" DROP COLUMN "selected_opt",
ADD COLUMN     "selected_answer" VARCHAR(10) NOT NULL,
ADD COLUMN     "time_taken" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "duel_questions" ADD COLUMN     "order_index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "duels" ADD COLUMN     "challenge_id" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'waiting';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "data" JSONB,
ADD COLUMN     "type" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "category_id",
DROP COLUMN "correct_option",
DROP COLUMN "difficulty_id",
DROP COLUMN "option_a",
DROP COLUMN "option_b",
DROP COLUMN "option_c",
DROP COLUMN "option_d",
DROP COLUMN "question_text",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "correct_answer" VARCHAR(10) NOT NULL,
ADD COLUMN     "difficulty" VARCHAR(20) NOT NULL,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "options" JSONB NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
ADD COLUMN     "time_limit" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "type" VARCHAR(20) NOT NULL DEFAULT 'mcq',
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "type" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "full_name",
DROP COLUMN "rating",
ADD COLUMN     "auth_provider" VARCHAR(20) NOT NULL DEFAULT 'email',
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "google_id" VARCHAR(255),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" VARCHAR(50) NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "difficulties";

-- DropTable
DROP TABLE "leaderboard";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "subscription_plans";

-- DropTable
DROP TABLE "user_subscriptions";

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_topics" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,

    CONSTRAINT "question_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_sets" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "author_id" INTEGER NOT NULL,
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "question_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_set_items" (
    "id" SERIAL NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "question_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" SERIAL NOT NULL,
    "challenger_id" INTEGER NOT NULL,
    "question_set_id" INTEGER,
    "type" VARCHAR(20) NOT NULL,
    "settings" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'invited',
    "score" INTEGER,
    "time_taken" INTEGER,
    "completed_at" TIMESTAMP,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_set_id" INTEGER,
    "challenge_id" INTEGER,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic_id" INTEGER,
    "period" VARCHAR(20) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "total_duels" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flags" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "question_topics_question_id_topic_id_key" ON "question_topics"("question_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_set_items_question_set_id_question_id_key" ON "question_set_items"("question_set_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challenge_id_user_id_key" ON "challenge_participants"("challenge_id", "user_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_topic_id_period_rating_idx" ON "leaderboard_entries"("topic_id", "period", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_user_id_topic_id_period_key" ON "leaderboard_entries"("user_id", "topic_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "duel_questions_duel_id_question_id_key" ON "duel_questions"("duel_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "duels_challenge_id_key" ON "duels"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_sets" ADD CONSTRAINT "question_sets_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_set_items" ADD CONSTRAINT "question_set_items_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_set_items" ADD CONSTRAINT "question_set_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challenger_id_fkey" FOREIGN KEY ("challenger_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duels" ADD CONSTRAINT "duels_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
