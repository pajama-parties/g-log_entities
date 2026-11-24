import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { ADVICE_TONES, type AdviceTone } from '../../enums.js';
import { Plant } from './plant.entity.js';
import { UserProfile } from './user-profile.entity.js';

/** service_db.advices — 조언 기록 (GET·POST /advices, PUT /advices/{id}/feedback) */
@Entity({ name: 'advices' })
@Index('idx_advices_user_created', ['userId', 'createdAt'])
export class Advice {
  @PrimaryGeneratedColumn({ name: 'advice_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  @Column({ name: 'plant_id', type: 'bigint' })
  plantId: number;

  @ManyToOne(() => Plant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant>;

  @Column({ type: 'enum', enum: ADVICE_TONES })
  tone: AdviceTone;

  /** value — 조언 받은 시점 수분. 오프라인이면 NULL */
  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  moisture: number | null;

  /** text */
  @Column({ type: 'varchar', length: 1000 })
  content: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  basis: string | null;

  /** true 도움이 됐어요 / false 아쉬워요 / null 평가 안 함 */
  @Column({ type: 'boolean', nullable: true })
  helpful: boolean | null;

  @Column({ name: 'feedback_at', type: 'datetime', nullable: true })
  feedbackAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
