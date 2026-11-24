import {
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
import { NOTICE_TONES, type NoticeTone } from '../../enums.js';
import { Plant } from './plant.entity.js';
import { UserProfile } from './user-profile.entity.js';

/**
 * service_db.notifications — 알림함 + 주간 경보 요약.
 * 삭제는 소프트 삭제: GET /notices/weekly는 withDeleted로 지운 알림도 셈.
 */
@Entity({ name: 'notifications' })
@Index('idx_notifications_user_created', ['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn({ name: 'notification_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  /** 안내 알림은 NULL */
  @Column({ name: 'plant_id', type: 'bigint', nullable: true })
  plantId: number | null;

  @ManyToOne(() => Plant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant> | null;

  @Column({ type: 'enum', enum: NOTICE_TONES })
  tone: NoticeTone;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  body: string | null;

  /** unread = !isRead */
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
