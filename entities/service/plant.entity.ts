import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { MOISTURE_STATUSES, type MoistureStatus } from '../../enums.js';
import { UserProfile } from './user-profile.entity.js';

/** service_db.plants — 화분 (GET /pots, /pots/managed, POST /pots) */
@Entity({ name: 'plants' })
@Index('idx_plants_user', ['userId'])
// TypeORM은 MySQL CHECK를 마이그레이션에 만들지 않음 → 마이그레이션에 직접 추가함 (InitService, PlantThresholdDefault)
@Check('chk_plants_threshold', 'dry_threshold >= 0 AND wet_threshold <= 100 AND dry_threshold < wet_threshold')
export class Plant {
  @PrimaryGeneratedColumn({ name: 'plant_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  /** plantType. NULL이면 응답에 '작물 미지정' */
  @Column({ name: 'plant_type', type: 'varchar', length: 30, nullable: true })
  plantType: string | null;

  /** NULL이면 응답에 '흙 미지정' */
  @Column({ type: 'varchar', length: 50, nullable: true })
  soil: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  place: string | null;

  /** range[0] / Range.lower (건조 기준 %). 기본 0 = 사용자가 기준을 정하기 전까지 건조 경보 없음 */
  @Column({ name: 'dry_threshold', type: 'tinyint', unsigned: true, default: 0 })
  dryThreshold: number;

  /** range[1] / Range.upper (과습 기준 %). 기본 100 = 사용자가 기준을 정하기 전까지 과습 경보 없음 */
  @Column({ name: 'wet_threshold', type: 'tinyint', unsigned: true, default: 100 })
  wetThreshold: number;

  @Column({ type: 'varchar', length: 30, default: 'plant' })
  icon: string;

  /** POT_COLORS 중 하나 (검증은 API에서) */
  @Column({ type: 'char', length: 7, default: '#304d42' })
  color: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  /** value (현재 수분 %) 캐시 */
  @Column({ name: 'last_moisture', type: 'tinyint', unsigned: true, nullable: true })
  lastMoisture: number | null;

  /** 판정 캐시. 응답 status의 오프라인/수집 대기는 계산 */
  @Column({ name: 'last_status', type: 'enum', enum: MOISTURE_STATUSES, nullable: true })
  lastStatus: MoistureStatus | null;

  @Column({ name: 'last_measured_at', type: 'datetime', nullable: true })
  lastMeasuredAt: Date | null;

  /** growingDays 계산 기준 */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
