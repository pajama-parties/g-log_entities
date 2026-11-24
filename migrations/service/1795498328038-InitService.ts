import { MigrationInterface, QueryRunner } from "typeorm";

export class InitService1795498328038 implements MigrationInterface {
    name = 'InitService1795498328038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`user_profiles\` (
                \`user_id\` bigint NOT NULL,
                \`nickname\` varchar(30) NOT NULL,
                \`kakao_consent\` tinyint NOT NULL DEFAULT 0,
                \`kakao_consent_at\` datetime NULL,
                \`notify_dry\` tinyint NOT NULL DEFAULT 1,
                \`notify_wet\` tinyint NOT NULL DEFAULT 1,
                \`notify_offline\` tinyint NOT NULL DEFAULT 1,
                \`notify_advice\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`user_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`plants\` (
                \`plant_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`name\` varchar(50) NOT NULL,
                \`plant_type\` varchar(30) NULL,
                \`soil\` varchar(50) NULL,
                \`place\` varchar(50) NULL,
                \`dry_threshold\` tinyint UNSIGNED NOT NULL DEFAULT '35',
                \`wet_threshold\` tinyint UNSIGNED NOT NULL DEFAULT '80',
                \`icon\` varchar(30) NOT NULL DEFAULT 'plant',
                \`color\` char(7) NOT NULL DEFAULT '#304d42',
                \`photo_url\` varchar(500) NULL,
                \`last_moisture\` tinyint UNSIGNED NULL,
                \`last_status\` enum ('OK', 'DRY', 'WET') NULL,
                \`last_measured_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                INDEX \`idx_plants_user\` (\`user_id\`),
                PRIMARY KEY (\`plant_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`advices\` (
                \`advice_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`plant_id\` bigint NOT NULL,
                \`tone\` enum ('DRY', 'WET', 'OK', 'OFFLINE') NOT NULL,
                \`moisture\` tinyint UNSIGNED NULL,
                \`content\` varchar(1000) NOT NULL,
                \`basis\` varchar(300) NULL,
                \`helpful\` tinyint NULL,
                \`feedback_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_advices_user_created\` (\`user_id\`, \`created_at\`),
                PRIMARY KEY (\`advice_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`posts\` (
                \`post_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`category\` enum ('QUESTION', 'RECORD', 'TIP') NOT NULL,
                \`crop\` varchar(20) NULL,
                \`title\` varchar(100) NOT NULL,
                \`body\` text NOT NULL,
                \`photo_url\` varchar(500) NULL,
                \`like_count\` int UNSIGNED NOT NULL DEFAULT '0',
                \`comment_count\` int UNSIGNED NOT NULL DEFAULT '0',
                \`is_hidden\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                INDEX \`idx_posts_category_created\` (\`category\`, \`created_at\`),
                INDEX \`idx_posts_created\` (\`created_at\`),
                PRIMARY KEY (\`post_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`comments\` (
                \`comment_id\` bigint NOT NULL AUTO_INCREMENT,
                \`post_id\` bigint NOT NULL,
                \`user_id\` bigint NOT NULL,
                \`content\` varchar(1000) NOT NULL,
                \`is_hidden\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                INDEX \`idx_comments_post\` (\`post_id\`),
                PRIMARY KEY (\`comment_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`devices\` (
                \`device_id\` bigint NOT NULL AUTO_INCREMENT,
                \`serial_number\` varchar(50) NOT NULL,
                \`user_id\` bigint NULL,
                \`plant_id\` bigint NULL,
                \`battery_level\` tinyint UNSIGNED NULL,
                \`report_interval_sec\` int UNSIGNED NOT NULL DEFAULT '600',
                \`firmware_version\` varchar(20) NULL,
                \`last_seen_at\` datetime NULL,
                \`registered_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_cc9e89897e336172fd06367735\` (\`serial_number\`),
                UNIQUE INDEX \`REL_29f9eb2535bf0a1398dc7d2381\` (\`plant_id\`),
                PRIMARY KEY (\`device_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`device_pairing_codes\` (
                \`pairing_id\` bigint NOT NULL AUTO_INCREMENT,
                \`plant_id\` bigint NOT NULL,
                \`user_id\` bigint NOT NULL,
                \`code\` char(7) NOT NULL,
                \`expires_at\` datetime NOT NULL,
                \`used_at\` datetime NULL,
                \`device_id\` bigint NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_pairing_code\` (\`code\`),
                PRIMARY KEY (\`pairing_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`notifications\` (
                \`notification_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`plant_id\` bigint NULL,
                \`tone\` enum ('DRY', 'WET', 'OK', 'OFFLINE', 'ADVICE', 'INFO') NOT NULL,
                \`title\` varchar(100) NOT NULL,
                \`body\` varchar(500) NULL,
                \`is_read\` tinyint NOT NULL DEFAULT 0,
                \`read_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                INDEX \`idx_notifications_user_created\` (\`user_id\`, \`created_at\`),
                PRIMARY KEY (\`notification_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`post_attachments\` (
                \`post_id\` bigint NOT NULL,
                \`source_plant_id\` bigint NULL,
                \`label\` varchar(100) NOT NULL,
                \`period\` enum ('24H', '7D') NOT NULL,
                \`points\` json NOT NULL,
                \`lower_threshold\` tinyint UNSIGNED NOT NULL,
                \`upper_threshold\` tinyint UNSIGNED NOT NULL,
                PRIMARY KEY (\`post_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`post_likes\` (
                \`post_id\` bigint NOT NULL,
                \`user_id\` bigint NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`post_id\`, \`user_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`sensor_readings\` (
                \`reading_id\` bigint NOT NULL AUTO_INCREMENT,
                \`device_id\` bigint NOT NULL,
                \`plant_id\` bigint NOT NULL,
                \`moisture_percent\` tinyint UNSIGNED NOT NULL,
                \`status\` enum ('OK', 'DRY', 'WET') NOT NULL,
                \`battery_level\` tinyint UNSIGNED NULL,
                \`measured_at\` datetime NOT NULL,
                \`received_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX \`idx_readings_plant_measured\` (\`plant_id\`, \`measured_at\`),
                PRIMARY KEY (\`reading_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`waterings\` (
                \`watering_id\` bigint NOT NULL AUTO_INCREMENT,
                \`plant_id\` bigint NOT NULL,
                \`watered_at\` datetime NOT NULL,
                \`moisture_before\` tinyint UNSIGNED NULL,
                \`moisture_after\` tinyint UNSIGNED NULL,
                \`source\` enum ('AUTO', 'MANUAL') NOT NULL DEFAULT 'AUTO',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_waterings_plant_watered\` (\`plant_id\`, \`watered_at\`),
                PRIMARY KEY (\`watering_id\`)
            ) ENGINE = InnoDB
        `);
        // TypeORM은 MySQL CHECK 제약을 만들지 않으므로 직접 추가 (Plant 엔티티의 @Check와 같은 내용)
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ADD CONSTRAINT \`chk_plants_threshold\` CHECK (dry_threshold >= 5 AND wet_threshold <= 95 AND dry_threshold < wet_threshold)
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ADD CONSTRAINT \`FK_c7493a5635af9cb25b8474a677e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`advices\`
            ADD CONSTRAINT \`FK_912b0e7f5b0c8aee7dd4f60bd70\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`advices\`
            ADD CONSTRAINT \`FK_5948a25a4e6ffa88b09f0f6088a\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`posts\`
            ADD CONSTRAINT \`FK_c4f9a7bd77b489e711277ee5986\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\`
            ADD CONSTRAINT \`FK_259bf9825d9d198608d1b46b0b5\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`post_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\`
            ADD CONSTRAINT \`FK_4c675567d2a58f0b07cef09c13d\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`devices\`
            ADD CONSTRAINT \`FK_5e9bee993b4ce35c3606cda194c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`devices\`
            ADD CONSTRAINT \`FK_29f9eb2535bf0a1398dc7d23810\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\`
            ADD CONSTRAINT \`FK_921f5e719d653f462a06a4f57eb\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\`
            ADD CONSTRAINT \`FK_3c0218509e234a8ec6de20172ae\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\`
            ADD CONSTRAINT \`FK_7a050afd69346bc468742d73398\` FOREIGN KEY (\`device_id\`) REFERENCES \`devices\`(\`device_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_9a8a82462cab47c73d25f49261f\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_38894ef355cf8c9f2b92afae06c\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_attachments\`
            ADD CONSTRAINT \`FK_4423ea1009e33b8a0a39a8b05af\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`post_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_attachments\`
            ADD CONSTRAINT \`FK_bcc2b518934fdda09f149a972f2\` FOREIGN KEY (\`source_plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_likes\`
            ADD CONSTRAINT \`FK_b40d37469c501092203d285af80\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`post_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_likes\`
            ADD CONSTRAINT \`FK_9b9a7fc5eeff133cf71b8e06a7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user_profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`sensor_readings\`
            ADD CONSTRAINT \`FK_5487f09197c0ff81de3ea08edc9\` FOREIGN KEY (\`device_id\`) REFERENCES \`devices\`(\`device_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`sensor_readings\`
            ADD CONSTRAINT \`FK_634b454a5b2f4c654325faddc2e\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`waterings\`
            ADD CONSTRAINT \`FK_fc87f1b8c92ca3fe7cf2c7af6f5\` FOREIGN KEY (\`plant_id\`) REFERENCES \`plants\`(\`plant_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`waterings\` DROP FOREIGN KEY \`FK_fc87f1b8c92ca3fe7cf2c7af6f5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`sensor_readings\` DROP FOREIGN KEY \`FK_634b454a5b2f4c654325faddc2e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`sensor_readings\` DROP FOREIGN KEY \`FK_5487f09197c0ff81de3ea08edc9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_likes\` DROP FOREIGN KEY \`FK_9b9a7fc5eeff133cf71b8e06a7b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_likes\` DROP FOREIGN KEY \`FK_b40d37469c501092203d285af80\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_attachments\` DROP FOREIGN KEY \`FK_bcc2b518934fdda09f149a972f2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post_attachments\` DROP FOREIGN KEY \`FK_4423ea1009e33b8a0a39a8b05af\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_38894ef355cf8c9f2b92afae06c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_9a8a82462cab47c73d25f49261f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\` DROP FOREIGN KEY \`FK_7a050afd69346bc468742d73398\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\` DROP FOREIGN KEY \`FK_3c0218509e234a8ec6de20172ae\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`device_pairing_codes\` DROP FOREIGN KEY \`FK_921f5e719d653f462a06a4f57eb\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`devices\` DROP FOREIGN KEY \`FK_29f9eb2535bf0a1398dc7d23810\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`devices\` DROP FOREIGN KEY \`FK_5e9bee993b4ce35c3606cda194c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4c675567d2a58f0b07cef09c13d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_259bf9825d9d198608d1b46b0b5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c4f9a7bd77b489e711277ee5986\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`advices\` DROP FOREIGN KEY \`FK_5948a25a4e6ffa88b09f0f6088a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`advices\` DROP FOREIGN KEY \`FK_912b0e7f5b0c8aee7dd4f60bd70\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\` DROP FOREIGN KEY \`FK_c7493a5635af9cb25b8474a677e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\` DROP CHECK \`chk_plants_threshold\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_waterings_plant_watered\` ON \`waterings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`waterings\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_readings_plant_measured\` ON \`sensor_readings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`sensor_readings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`post_likes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`post_attachments\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_notifications_user_created\` ON \`notifications\`
        `);
        await queryRunner.query(`
            DROP TABLE \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_pairing_code\` ON \`device_pairing_codes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`device_pairing_codes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_29f9eb2535bf0a1398dc7d2381\` ON \`devices\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_cc9e89897e336172fd06367735\` ON \`devices\`
        `);
        await queryRunner.query(`
            DROP TABLE \`devices\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_comments_post\` ON \`comments\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comments\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_posts_created\` ON \`posts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_posts_category_created\` ON \`posts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`posts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_advices_user_created\` ON \`advices\`
        `);
        await queryRunner.query(`
            DROP TABLE \`advices\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_plants_user\` ON \`plants\`
        `);
        await queryRunner.query(`
            DROP TABLE \`plants\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_profiles\`
        `);
    }

}
