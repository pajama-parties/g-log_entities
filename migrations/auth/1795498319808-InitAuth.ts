import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAuth1795498319808 implements MigrationInterface {
    name = 'InitAuth1795498319808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`user_id\` bigint NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NULL,
                \`password_hash\` varchar(255) NULL,
                \`password_changed_at\` datetime NULL,
                \`email_verified\` tinyint NOT NULL DEFAULT 0,
                \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
                \`status\` enum ('ACTIVE', 'SUSPENDED', 'WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
                \`last_login_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                PRIMARY KEY (\`user_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth_tokens\` (
                \`auth_token_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`purpose\` enum ('EMAIL_VERIFY', 'PASSWORD_RESET') NOT NULL,
                \`token_hash\` char(64) NOT NULL,
                \`expires_at\` datetime NOT NULL,
                \`used_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_3a94cfa1eada85ac2bf6f3016b\` (\`token_hash\`),
                PRIMARY KEY (\`auth_token_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`device_credentials\` (
                \`device_id\` bigint NOT NULL,
                \`api_key_hash\` char(64) NOT NULL,
                \`issued_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`revoked_at\` datetime NULL,
                UNIQUE INDEX \`IDX_7331269fa30c132b5cdd00ae1c\` (\`api_key_hash\`),
                PRIMARY KEY (\`device_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`login_history\` (
                \`login_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NULL,
                \`method\` enum ('EMAIL', 'KAKAO') NOT NULL,
                \`success\` tinyint NOT NULL,
                \`ip_address\` varchar(45) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_login_history_created_at\` (\`created_at\`),
                PRIMARY KEY (\`login_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`oauth_accounts\` (
                \`oauth_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`provider\` enum ('KAKAO') NOT NULL,
                \`provider_user_id\` varchar(100) NOT NULL,
                \`provider_email\` varchar(255) NULL,
                \`access_token_enc\` varbinary(512) NULL,
                \`refresh_token_enc\` varbinary(512) NULL,
                \`token_expires_at\` datetime NULL,
                \`linked_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`uq_oauth_user_provider\` (\`user_id\`, \`provider\`),
                UNIQUE INDEX \`uq_oauth_provider_user\` (\`provider\`, \`provider_user_id\`),
                PRIMARY KEY (\`oauth_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`sessions\` (
                \`session_id\` bigint NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint NOT NULL,
                \`token_hash\` char(64) NOT NULL,
                \`user_agent\` varchar(255) NULL,
                \`ip_address\` varchar(45) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`last_accessed_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`expires_at\` datetime NOT NULL,
                \`revoked_at\` datetime NULL,
                UNIQUE INDEX \`IDX_abaa9e068cdd390bc5210f7988\` (\`token_hash\`),
                PRIMARY KEY (\`session_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_tokens\`
            ADD CONSTRAINT \`FK_9691367d446cd8b18f462c191b3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`login_history\`
            ADD CONSTRAINT \`FK_ad9ce49cb73c0b33746a56b6bd1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`oauth_accounts\`
            ADD CONSTRAINT \`FK_22a05e92f51a983475f9281d3b0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`sessions\`
            ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_085d540d9f418cfbdc7bd55bb19\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`oauth_accounts\` DROP FOREIGN KEY \`FK_22a05e92f51a983475f9281d3b0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`login_history\` DROP FOREIGN KEY \`FK_ad9ce49cb73c0b33746a56b6bd1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth_tokens\` DROP FOREIGN KEY \`FK_9691367d446cd8b18f462c191b3\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_abaa9e068cdd390bc5210f7988\` ON \`sessions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`sessions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`uq_oauth_provider_user\` ON \`oauth_accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`uq_oauth_user_provider\` ON \`oauth_accounts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`oauth_accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_login_history_created_at\` ON \`login_history\`
        `);
        await queryRunner.query(`
            DROP TABLE \`login_history\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7331269fa30c132b5cdd00ae1c\` ON \`device_credentials\`
        `);
        await queryRunner.query(`
            DROP TABLE \`device_credentials\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3a94cfa1eada85ac2bf6f3016b\` ON \`auth_tokens\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth_tokens\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
    }

}
