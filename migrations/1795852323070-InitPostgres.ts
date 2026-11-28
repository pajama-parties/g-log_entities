import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * PostgreSQL 초기 스키마. MySQL의 auth_db·service_db 두 DB를 한 DB의 auth·service 스키마로 옮김.
 * - 예전의 논리 FK를 실제 FK로 바꿈: service.user_profiles.user_id → auth.users, auth.device_credentials.device_id → service.devices
 *   (auth.refresh_tokens.user_id → auth.users 도 추가)
 * - service.moisture_status 타입은 plants·sensor_readings가 함께 써서, 생성기가 두 번 만들던 것을 한 번으로 정리함
 * - MySQL 마이그레이션(InitAuth, JwtRefreshTokens, InitService, PlantThresholdDefault)을 대체함. MySQL 데이터는 옮기지 않음
 */
export class InitPostgres1795852323070 implements MigrationInterface {
    name = 'InitPostgres1795852323070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SCHEMA IF NOT EXISTS "auth"
        `);
        await queryRunner.query(`
            CREATE SCHEMA IF NOT EXISTS "service"
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."user_role" AS ENUM('USER', 'ADMIN')
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'WITHDRAWN')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."users" (
                "user_id" BIGSERIAL NOT NULL,
                "email" character varying(255),
                "password_hash" character varying(255),
                "password_changed_at" TIMESTAMP WITH TIME ZONE,
                "email_verified" boolean NOT NULL DEFAULT false,
                "role" "auth"."user_role" NOT NULL DEFAULT 'USER',
                "status" "auth"."user_status" NOT NULL DEFAULT 'ACTIVE',
                "last_login_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."auth_token_purpose" AS ENUM('EMAIL_VERIFY', 'PASSWORD_RESET')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."auth_tokens" (
                "auth_token_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "purpose" "auth"."auth_token_purpose" NOT NULL,
                "token_hash" character(64) NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "used_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_3a94cfa1eada85ac2bf6f3016b7" UNIQUE ("token_hash"),
                CONSTRAINT "PK_cd7109d44429c8312ff1e04aff5" PRIMARY KEY ("auth_token_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."user_profiles" (
                "user_id" bigint NOT NULL,
                "nickname" character varying(30) NOT NULL,
                "kakao_consent" boolean NOT NULL DEFAULT false,
                "kakao_consent_at" TIMESTAMP WITH TIME ZONE,
                "notify_dry" boolean NOT NULL DEFAULT true,
                "notify_wet" boolean NOT NULL DEFAULT true,
                "notify_offline" boolean NOT NULL DEFAULT true,
                "notify_advice" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6ca9503d77ae39b4b5a6cc3ba88" PRIMARY KEY ("user_id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."moisture_status" AS ENUM('OK', 'DRY', 'WET')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."plants" (
                "plant_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "name" character varying(50) NOT NULL,
                "plant_type" character varying(30),
                "soil" character varying(50),
                "place" character varying(50),
                "dry_threshold" smallint NOT NULL DEFAULT '0',
                "wet_threshold" smallint NOT NULL DEFAULT '100',
                "icon" character varying(30) NOT NULL DEFAULT 'plant',
                "color" character(7) NOT NULL DEFAULT '#304d42',
                "photo_url" character varying(500),
                "last_moisture" smallint,
                "last_status" "service"."moisture_status",
                "last_measured_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "chk_plants_threshold" CHECK (
                    dry_threshold >= 0
                    AND wet_threshold <= 100
                    AND dry_threshold < wet_threshold
                ),
                CONSTRAINT "PK_60c4ce022aa722af6185e5d8518" PRIMARY KEY ("plant_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_plants_user" ON "service"."plants" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."devices" (
                "device_id" BIGSERIAL NOT NULL,
                "serial_number" character varying(50) NOT NULL,
                "user_id" bigint,
                "plant_id" bigint,
                "battery_level" smallint,
                "report_interval_sec" integer NOT NULL DEFAULT '600',
                "firmware_version" character varying(20),
                "last_seen_at" TIMESTAMP WITH TIME ZONE,
                "registered_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_cc9e89897e336172fd06367735d" UNIQUE ("serial_number"),
                CONSTRAINT "REL_29f9eb2535bf0a1398dc7d2381" UNIQUE ("plant_id"),
                CONSTRAINT "PK_2667f40edb344d6f274a0d42b6f" PRIMARY KEY ("device_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."device_credentials" (
                "device_id" bigint NOT NULL,
                "api_key_hash" character(64) NOT NULL,
                "issued_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "revoked_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_7331269fa30c132b5cdd00ae1c4" UNIQUE ("api_key_hash"),
                CONSTRAINT "PK_838147fb05afc59ee78c3788fd3" PRIMARY KEY ("device_id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."login_method" AS ENUM('EMAIL', 'KAKAO')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."login_history" (
                "login_id" BIGSERIAL NOT NULL,
                "user_id" bigint,
                "method" "auth"."login_method" NOT NULL,
                "success" boolean NOT NULL,
                "ip_address" character varying(45),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_91748b790081cecc891aa6168ff" PRIMARY KEY ("login_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_login_history_created_at" ON "auth"."login_history" ("created_at")
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."oauth_provider" AS ENUM('KAKAO')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."oauth_accounts" (
                "oauth_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "provider" "auth"."oauth_provider" NOT NULL,
                "provider_user_id" character varying(100) NOT NULL,
                "provider_email" character varying(255),
                "access_token_enc" bytea,
                "refresh_token_enc" bytea,
                "token_expires_at" TIMESTAMP WITH TIME ZONE,
                "linked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_47a503ec03bd26c7ade4b161a2d" PRIMARY KEY ("oauth_id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "uq_oauth_user_provider" ON "auth"."oauth_accounts" ("user_id", "provider")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "uq_oauth_provider_user" ON "auth"."oauth_accounts" ("provider", "provider_user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."refresh_token_families" (
                "family_id" character varying(64) NOT NULL,
                "user_id" bigint NOT NULL,
                "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
                "revoked_at" TIMESTAMP(3) WITH TIME ZONE,
                CONSTRAINT "PK_61dc26dacf60b984125153c3aff" PRIMARY KEY ("family_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_rtf_user" ON "auth"."refresh_token_families" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."refresh_tokens" (
                "token_hash" character varying(64) NOT NULL,
                "family_id" character varying(64) NOT NULL,
                "user_id" bigint NOT NULL,
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
                "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
                "used_at" TIMESTAMP(3) WITH TIME ZONE,
                "claims" jsonb,
                CONSTRAINT "PK_a7838d2ba25be1342091b6695f1" PRIMARY KEY ("token_hash")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_rt_family" ON "auth"."refresh_tokens" ("family_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."advice_tone" AS ENUM('DRY', 'WET', 'OK', 'OFFLINE')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."advices" (
                "advice_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "plant_id" bigint NOT NULL,
                "tone" "service"."advice_tone" NOT NULL,
                "moisture" smallint,
                "content" character varying(1000) NOT NULL,
                "basis" character varying(300),
                "helpful" boolean,
                "feedback_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b7b694f95ff9fbcd0e4ac7ed1ed" PRIMARY KEY ("advice_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_advices_user_created" ON "service"."advices" ("user_id", "created_at")
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."post_category" AS ENUM('QUESTION', 'RECORD', 'TIP')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."posts" (
                "post_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "category" "service"."post_category" NOT NULL,
                "crop" character varying(20),
                "title" character varying(100) NOT NULL,
                "body" text NOT NULL,
                "photo_url" character varying(500),
                "like_count" integer NOT NULL DEFAULT '0',
                "comment_count" integer NOT NULL DEFAULT '0',
                "is_hidden" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_e55cc433639d0e21c3dbf637bce" PRIMARY KEY ("post_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_posts_category_created" ON "service"."posts" ("category", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_posts_created" ON "service"."posts" ("created_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."comments" (
                "comment_id" BIGSERIAL NOT NULL,
                "post_id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "content" character varying(1000) NOT NULL,
                "is_hidden" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY ("comment_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_comments_post" ON "service"."comments" ("post_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."device_pairing_codes" (
                "pairing_id" BIGSERIAL NOT NULL,
                "plant_id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "code" character(7) NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "used_at" TIMESTAMP WITH TIME ZONE,
                "device_id" bigint,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1a76881a21fdb783e5cd44d8cf6" PRIMARY KEY ("pairing_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_pairing_code" ON "service"."device_pairing_codes" ("code")
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."notice_tone" AS ENUM('DRY', 'WET', 'OK', 'OFFLINE', 'ADVICE', 'INFO')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."notifications" (
                "notification_id" BIGSERIAL NOT NULL,
                "user_id" bigint NOT NULL,
                "plant_id" bigint,
                "tone" "service"."notice_tone" NOT NULL,
                "title" character varying(100) NOT NULL,
                "body" character varying(500),
                "is_read" boolean NOT NULL DEFAULT false,
                "read_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_eaedfe19f0f765d26afafa85956" PRIMARY KEY ("notification_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_notifications_user_created" ON "service"."notifications" ("user_id", "created_at")
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."chart_period" AS ENUM('24H', '7D')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."post_attachments" (
                "post_id" bigint NOT NULL,
                "source_plant_id" bigint,
                "label" character varying(100) NOT NULL,
                "period" "service"."chart_period" NOT NULL,
                "points" jsonb NOT NULL,
                "lower_threshold" smallint NOT NULL,
                "upper_threshold" smallint NOT NULL,
                CONSTRAINT "PK_4423ea1009e33b8a0a39a8b05af" PRIMARY KEY ("post_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."post_likes" (
                "post_id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8f64693922a9e8c4e2605850d0b" PRIMARY KEY ("post_id", "user_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."sensor_readings" (
                "reading_id" BIGSERIAL NOT NULL,
                "device_id" bigint NOT NULL,
                "plant_id" bigint NOT NULL,
                "moisture_percent" smallint NOT NULL,
                "status" "service"."moisture_status" NOT NULL,
                "battery_level" smallint,
                "measured_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_915405f48274cf9521c78965bf6" PRIMARY KEY ("reading_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_readings_plant_measured" ON "service"."sensor_readings" ("plant_id", "measured_at")
        `);
        await queryRunner.query(`
            CREATE TYPE "service"."watering_source" AS ENUM('AUTO', 'MANUAL')
        `);
        await queryRunner.query(`
            CREATE TABLE "service"."waterings" (
                "watering_id" BIGSERIAL NOT NULL,
                "plant_id" bigint NOT NULL,
                "watered_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "moisture_before" smallint,
                "moisture_after" smallint,
                "source" "service"."watering_source" NOT NULL DEFAULT 'AUTO',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4354c51464beb56f1bc8c432acd" PRIMARY KEY ("watering_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_waterings_plant_watered" ON "service"."waterings" ("plant_id", "watered_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."auth_tokens"
            ADD CONSTRAINT "FK_9691367d446cd8b18f462c191b3" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."user_profiles"
            ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."plants"
            ADD CONSTRAINT "FK_c7493a5635af9cb25b8474a677e" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."devices"
            ADD CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."devices"
            ADD CONSTRAINT "FK_29f9eb2535bf0a1398dc7d23810" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."device_credentials"
            ADD CONSTRAINT "FK_838147fb05afc59ee78c3788fd3" FOREIGN KEY ("device_id") REFERENCES "service"."devices"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."login_history"
            ADD CONSTRAINT "FK_ad9ce49cb73c0b33746a56b6bd1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."oauth_accounts"
            ADD CONSTRAINT "FK_22a05e92f51a983475f9281d3b0" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_token_families"
            ADD CONSTRAINT "FK_cb724d64e7cc9276571acdabeb5" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_tokens"
            ADD CONSTRAINT "FK_d5e27da0cd39bc3bb2811fc8bac" FOREIGN KEY ("family_id") REFERENCES "auth"."refresh_token_families"("family_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_tokens"
            ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."advices"
            ADD CONSTRAINT "FK_912b0e7f5b0c8aee7dd4f60bd70" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."advices"
            ADD CONSTRAINT "FK_5948a25a4e6ffa88b09f0f6088a" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."posts"
            ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."comments"
            ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "service"."posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."comments"
            ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes"
            ADD CONSTRAINT "FK_921f5e719d653f462a06a4f57eb" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes"
            ADD CONSTRAINT "FK_3c0218509e234a8ec6de20172ae" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes"
            ADD CONSTRAINT "FK_7a050afd69346bc468742d73398" FOREIGN KEY ("device_id") REFERENCES "service"."devices"("device_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."notifications"
            ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."notifications"
            ADD CONSTRAINT "FK_38894ef355cf8c9f2b92afae06c" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_attachments"
            ADD CONSTRAINT "FK_4423ea1009e33b8a0a39a8b05af" FOREIGN KEY ("post_id") REFERENCES "service"."posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_attachments"
            ADD CONSTRAINT "FK_bcc2b518934fdda09f149a972f2" FOREIGN KEY ("source_plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_likes"
            ADD CONSTRAINT "FK_b40d37469c501092203d285af80" FOREIGN KEY ("post_id") REFERENCES "service"."posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_likes"
            ADD CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b" FOREIGN KEY ("user_id") REFERENCES "service"."user_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."sensor_readings"
            ADD CONSTRAINT "FK_5487f09197c0ff81de3ea08edc9" FOREIGN KEY ("device_id") REFERENCES "service"."devices"("device_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."sensor_readings"
            ADD CONSTRAINT "FK_634b454a5b2f4c654325faddc2e" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."waterings"
            ADD CONSTRAINT "FK_fc87f1b8c92ca3fe7cf2c7af6f5" FOREIGN KEY ("plant_id") REFERENCES "service"."plants"("plant_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "service"."waterings" DROP CONSTRAINT "FK_fc87f1b8c92ca3fe7cf2c7af6f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."sensor_readings" DROP CONSTRAINT "FK_634b454a5b2f4c654325faddc2e"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."sensor_readings" DROP CONSTRAINT "FK_5487f09197c0ff81de3ea08edc9"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_likes" DROP CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_likes" DROP CONSTRAINT "FK_b40d37469c501092203d285af80"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_attachments" DROP CONSTRAINT "FK_bcc2b518934fdda09f149a972f2"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."post_attachments" DROP CONSTRAINT "FK_4423ea1009e33b8a0a39a8b05af"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."notifications" DROP CONSTRAINT "FK_38894ef355cf8c9f2b92afae06c"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes" DROP CONSTRAINT "FK_7a050afd69346bc468742d73398"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes" DROP CONSTRAINT "FK_3c0218509e234a8ec6de20172ae"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."device_pairing_codes" DROP CONSTRAINT "FK_921f5e719d653f462a06a4f57eb"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."advices" DROP CONSTRAINT "FK_5948a25a4e6ffa88b09f0f6088a"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."advices" DROP CONSTRAINT "FK_912b0e7f5b0c8aee7dd4f60bd70"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "FK_d5e27da0cd39bc3bb2811fc8bac"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."refresh_token_families" DROP CONSTRAINT "FK_cb724d64e7cc9276571acdabeb5"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."oauth_accounts" DROP CONSTRAINT "FK_22a05e92f51a983475f9281d3b0"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."login_history" DROP CONSTRAINT "FK_ad9ce49cb73c0b33746a56b6bd1"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."device_credentials" DROP CONSTRAINT "FK_838147fb05afc59ee78c3788fd3"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."devices" DROP CONSTRAINT "FK_29f9eb2535bf0a1398dc7d23810"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."devices" DROP CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."plants" DROP CONSTRAINT "FK_c7493a5635af9cb25b8474a677e"
        `);
        await queryRunner.query(`
            ALTER TABLE "service"."user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"."auth_tokens" DROP CONSTRAINT "FK_9691367d446cd8b18f462c191b3"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_waterings_plant_watered"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."waterings"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."watering_source"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_readings_plant_measured"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."sensor_readings"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."post_likes"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."post_attachments"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."chart_period"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_notifications_user_created"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."notifications"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."notice_tone"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_pairing_code"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."device_pairing_codes"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_comments_post"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."comments"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_posts_created"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_posts_category_created"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."posts"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."post_category"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_advices_user_created"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."advices"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."advice_tone"
        `);
        await queryRunner.query(`
            DROP INDEX "auth"."idx_rt_family"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."refresh_tokens"
        `);
        await queryRunner.query(`
            DROP INDEX "auth"."idx_rtf_user"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."refresh_token_families"
        `);
        await queryRunner.query(`
            DROP INDEX "auth"."uq_oauth_provider_user"
        `);
        await queryRunner.query(`
            DROP INDEX "auth"."uq_oauth_user_provider"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."oauth_accounts"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."oauth_provider"
        `);
        await queryRunner.query(`
            DROP INDEX "auth"."idx_login_history_created_at"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."login_history"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."login_method"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."device_credentials"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."devices"
        `);
        await queryRunner.query(`
            DROP INDEX "service"."idx_plants_user"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."plants"
        `);
        await queryRunner.query(`
            DROP TYPE "service"."moisture_status"
        `);
        await queryRunner.query(`
            DROP TABLE "service"."user_profiles"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."auth_tokens"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."auth_token_purpose"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"."users"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."user_status"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."user_role"
        `);
        await queryRunner.query(`
            DROP SCHEMA "service"
        `);
        await queryRunner.query(`
            DROP SCHEMA "auth"
        `);
    }

}
