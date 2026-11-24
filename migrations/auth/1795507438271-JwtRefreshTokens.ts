import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 세션 쿠키(sessions) → JWT + refresh 토큰(refresh_token_families, refresh_tokens).
 * TypeORM은 엔티티가 없어진 테이블을 지우지 않으므로 sessions 삭제·복구는 직접 넣음.
 */
export class JwtRefreshTokens1795507438271 implements MigrationInterface {
    name = 'JwtRefreshTokens1795507438271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`sessions\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`refresh_token_families\` (
                \`family_id\` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
                \`user_id\` bigint NOT NULL,
                \`expires_at\` datetime(3) NOT NULL,
                \`revoked_at\` datetime(3) NULL,
                INDEX \`idx_rtf_user\` (\`user_id\`),
                PRIMARY KEY (\`family_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`refresh_tokens\` (
                \`token_hash\` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
                \`family_id\` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
                \`user_id\` bigint NOT NULL,
                \`created_at\` datetime(3) NOT NULL,
                \`expires_at\` datetime(3) NOT NULL,
                \`used_at\` datetime(3) NULL,
                \`claims\` json NULL,
                INDEX \`idx_rt_family\` (\`family_id\`),
                PRIMARY KEY (\`token_hash\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`refresh_token_families\`
            ADD CONSTRAINT \`FK_cb724d64e7cc9276571acdabeb5\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`refresh_tokens\`
            ADD CONSTRAINT \`FK_d5e27da0cd39bc3bb2811fc8bac\` FOREIGN KEY (\`family_id\`) REFERENCES \`refresh_token_families\`(\`family_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_d5e27da0cd39bc3bb2811fc8bac\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`refresh_token_families\` DROP FOREIGN KEY \`FK_cb724d64e7cc9276571acdabeb5\`
        `);
        await queryRunner.query(`
            DROP TABLE \`refresh_tokens\`
        `);
        await queryRunner.query(`
            DROP TABLE \`refresh_token_families\`
        `);
        // sessions 복구 (InitAuth와 같은 정의)
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
            ALTER TABLE \`sessions\`
            ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
