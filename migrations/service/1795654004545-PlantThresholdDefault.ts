import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 화분 경보 기준 기본값 35/80 → 0/100, 허용 범위 5~95 → 0~100.
 * 기본값 0~100이면 판정이 항상 적정 → 사용자가 기준을 저장(PUT /pots/{potId}/range)하기 전까지 경보 없음.
 * 기존 화분의 기준값은 그대로 둠.
 */
export class PlantThresholdDefault1795654004545 implements MigrationInterface {
    name = 'PlantThresholdDefault1795654004545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`plants\` DROP CHECK \`chk_plants_threshold\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ALTER COLUMN \`dry_threshold\` SET DEFAULT 0,
            ALTER COLUMN \`wet_threshold\` SET DEFAULT 100
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ADD CONSTRAINT \`chk_plants_threshold\` CHECK (dry_threshold >= 0 AND wet_threshold <= 100 AND dry_threshold < wet_threshold)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`plants\` DROP CHECK \`chk_plants_threshold\`
        `);
        // 5~95 범위를 벗어난 값은 되돌릴 수 없으므로 원래 범위로 맞춤
        await queryRunner.query(`
            UPDATE \`plants\` SET \`dry_threshold\` = GREATEST(\`dry_threshold\`, 5), \`wet_threshold\` = LEAST(\`wet_threshold\`, 95)
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ALTER COLUMN \`dry_threshold\` SET DEFAULT 35,
            ALTER COLUMN \`wet_threshold\` SET DEFAULT 80
        `);
        await queryRunner.query(`
            ALTER TABLE \`plants\`
            ADD CONSTRAINT \`chk_plants_threshold\` CHECK (dry_threshold >= 5 AND wet_threshold <= 95 AND dry_threshold < wet_threshold)
        `);
    }
}
