-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "auth"."aal_level" AS ENUM ('aal1', 'aal2', 'aal3');

-- CreateEnum
CREATE TYPE "auth"."code_challenge_method" AS ENUM ('s256', 'plain');

-- CreateEnum
CREATE TYPE "auth"."factor_status" AS ENUM ('unverified', 'verified');

-- CreateEnum
CREATE TYPE "auth"."factor_type" AS ENUM ('totp', 'webauthn', 'phone');

-- CreateEnum
CREATE TYPE "auth"."one_time_token_type" AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');

-- CreateTable
CREATE TABLE "public"."p25vid1" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p25vid1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p25vid2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p25vid2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p25vid3" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p25vid3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p26vid1" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p26vid1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p26vid2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p26vid2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p26vid3" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p26vid3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p27vid1" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p27vid1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p27vid2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p27vid2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p27vid3" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p27vid3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p28vid1" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p28vid1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."p28vid2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "segment_text" TEXT,
    "start_time" DOUBLE PRECISION,
    "end_time" DOUBLE PRECISION,
    "words" JSONB,
    "segment_text_clean" TEXT,

    CONSTRAINT "p28vid2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proceeding" (
    "id" SERIAL NOT NULL,
    "term" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "dates" TEXT[],

    CONSTRAINT "proceeding_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proceeding_day" (
    "id" SERIAL NOT NULL,
    "proceeding_id" INTEGER NOT NULL,
    "day_no" SMALLINT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "proceeding_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proceeding_point_ai" (
    "id" SERIAL NOT NULL,
    "proceeding_day_id" INTEGER NOT NULL,
    "official_point" TEXT NOT NULL,
    "official_topic" TEXT NOT NULL,
    "summary_main" JSONB,
    "summary_tldr" TEXT,
    "topic" TEXT,
    "number_sequence" INTEGER,
    "voting_numbers" INTEGER[],
    "print_numbers" TEXT[],

    CONSTRAINT "proceeding_point_ai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."statement" (
    "id" SERIAL NOT NULL,
    "proceeding_day_id" INTEGER NOT NULL,
    "number_sequence" INTEGER NOT NULL,
    "number_source" INTEGER NOT NULL,
    "official_point" TEXT,
    "official_topic" TEXT,
    "text" TEXT,
    "speaker_name" TEXT,
    "speaker_function" TEXT,
    "official_prints" TEXT[],
    "voting_numbers" TEXT[],

    CONSTRAINT "statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."statement_ai" (
    "id" SERIAL NOT NULL,
    "statement_id" INTEGER NOT NULL,
    "summary_discussion" TEXT,
    "summary_tldr" TEXT,
    "interruptions" JSONB,
    "speaker_rating" JSONB,
    "topic_attitude" JSONB,
    "topic" TEXT,
    "citations" TEXT[],
    "yt_sec" TEXT,
    "point_split" JSONB,
    "start_end_time" TEXT,
    "citations_time" TEXT[],

    CONSTRAINT "statement_ai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."statement_to_point" (
    "id" SERIAL NOT NULL,
    "statement_id" INTEGER NOT NULL,
    "proceeding_point_ai_id" INTEGER NOT NULL,

    CONSTRAINT "statement_to_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag" (
    "id" SERIAL NOT NULL,
    "tag" VARCHAR(255) NOT NULL,
    "sub_tag" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag_to_point" (
    "id" SERIAL NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "proceeding_point_ai_id" INTEGER NOT NULL,

    CONSTRAINT "tag_to_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag_to_print" (
    "id" SERIAL NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "print_number" VARCHAR(50) NOT NULL,

    CONSTRAINT "tag_to_print_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tmp_emo" (
    "id" SERIAL NOT NULL,
    "chunk_start_sec" DOUBLE PRECISION NOT NULL,
    "chunk_end_sec" DOUBLE PRECISION NOT NULL,
    "emotion_label" TEXT,
    "event_label" TEXT,
    "shouting" BOOLEAN,
    "avg_db" DOUBLE PRECISION,
    "peak_db" DOUBLE PRECISION,
    "clap_audio_event" TEXT,

    CONSTRAINT "tmp_emo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "p25vid1_segment_text_clean_trgm_idx" ON "public"."p25vid1" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p25vid1_segment_text_trgm_idx" ON "public"."p25vid1" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p25vid2_segment_text_clean_trgm_idx" ON "public"."p25vid2" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p25vid2_segment_text_trgm_idx" ON "public"."p25vid2" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p25vid3_segment_text_clean_trgm_idx" ON "public"."p25vid3" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p25vid3_segment_text_trgm_idx" ON "public"."p25vid3" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid1_segment_text_clean_trgm_idx" ON "public"."p26vid1" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid1_segment_text_trgm_idx" ON "public"."p26vid1" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid2_segment_text_clean_trgm_idx" ON "public"."p26vid2" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid2_segment_text_trgm_idx" ON "public"."p26vid2" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid3_segment_text_clean_trgm_idx" ON "public"."p26vid3" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p26vid3_segment_text_trgm_idx" ON "public"."p26vid3" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid1_segment_text_clean_trgm_idx" ON "public"."p27vid1" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid1_segment_text_trgm_idx" ON "public"."p27vid1" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid2_segment_text_clean_trgm_idx" ON "public"."p27vid2" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid2_segment_text_trgm_idx" ON "public"."p27vid2" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid3_segment_text_clean_trgm_idx" ON "public"."p27vid3" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p27vid3_segment_text_trgm_idx" ON "public"."p27vid3" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p28vid1_segment_text_clean_trgm_idx" ON "public"."p28vid1" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p28vid1_segment_text_trgm_idx" ON "public"."p28vid1" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p28vid2_segment_text_clean_trgm_idx" ON "public"."p28vid2" USING GIN ("segment_text_clean" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "p28vid2_segment_text_trgm_idx" ON "public"."p28vid2" USING GIN ("segment_text" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "proceeding_unique_term_number" ON "public"."proceeding"("term", "number");

-- CreateIndex
CREATE UNIQUE INDEX "unique_proceeding_day" ON "public"."proceeding_day"("proceeding_id", "day_no");

-- CreateIndex
CREATE UNIQUE INDEX "proceeding_point_ai_unique" ON "public"."proceeding_point_ai"("proceeding_day_id", "number_sequence");

-- CreateIndex
CREATE UNIQUE INDEX "statement_unique_per_day" ON "public"."statement"("proceeding_day_id", "number_sequence", "number_source");

-- CreateIndex
CREATE UNIQUE INDEX "statement_ai_unique" ON "public"."statement_ai"("statement_id");

-- CreateIndex
CREATE UNIQUE INDEX "statement_to_point_unique" ON "public"."statement_to_point"("statement_id", "proceeding_point_ai_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_unique" ON "public"."tag"("id", "tag", "sub_tag");

-- CreateIndex
CREATE UNIQUE INDEX "tag_to_point_unique" ON "public"."tag_to_point"("tag_id", "proceeding_point_ai_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_to_print_unique" ON "public"."tag_to_print"("tag_id", "print_number");

-- AddForeignKey
ALTER TABLE "public"."proceeding_day" ADD CONSTRAINT "fk_proceeding" FOREIGN KEY ("proceeding_id") REFERENCES "public"."proceeding"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."proceeding_point_ai" ADD CONSTRAINT "fk_proceeding_day_ai" FOREIGN KEY ("proceeding_day_id") REFERENCES "public"."proceeding_day"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."statement" ADD CONSTRAINT "fk_proceeding_day" FOREIGN KEY ("proceeding_day_id") REFERENCES "public"."proceeding_day"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."statement_ai" ADD CONSTRAINT "fk_statement_ai" FOREIGN KEY ("statement_id") REFERENCES "public"."statement"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."statement_to_point" ADD CONSTRAINT "fk_proceeding_point_ai" FOREIGN KEY ("proceeding_point_ai_id") REFERENCES "public"."proceeding_point_ai"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."statement_to_point" ADD CONSTRAINT "fk_statement" FOREIGN KEY ("statement_id") REFERENCES "public"."statement"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag_to_point" ADD CONSTRAINT "fk_proceeding_point_ai" FOREIGN KEY ("proceeding_point_ai_id") REFERENCES "public"."proceeding_point_ai"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag_to_point" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tag_to_print" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

