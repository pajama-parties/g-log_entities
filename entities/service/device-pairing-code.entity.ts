import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Device } from './device.entity.js';
import { Plant } from './plant.entity.js';
import { UserProfile } from './user-profile.entity.js';

/** service.device_pairing_codes — POST /pots 응답의 센서 등록 코드 (10분 유효) */
@Entity({ schema: 'service', name: 'device_pairing_codes' })
@Index('idx_pairing_code', ['code'])
export class DevicePairingCode {
  @PrimaryGeneratedColumn({ name: 'pairing_id', type: 'bigint' })
  id: number;

  @Column({ name: 'plant_id', type: 'bigint' })
  plantId: number;

  @ManyToOne(() => Plant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  /** 예: K7P-3QX */
  @Column({ type: 'char', length: 7 })
  code: string;

  /** 발급 + 600초 */
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  /** connected = usedAt !== null */
  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'device_id', type: 'bigint', nullable: true })
  deviceId: number | null;

  @ManyToOne(() => Device, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: Relation<Device> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
