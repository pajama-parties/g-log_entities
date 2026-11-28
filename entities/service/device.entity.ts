import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Plant } from './plant.entity.js';
import { UserProfile } from './user-profile.entity.js';

/** service.devices — 수분 센서. 센서 1 : 화분 1 */
@Entity({ schema: 'service', name: 'devices' })
export class Device {
  @PrimaryGeneratedColumn({ name: 'device_id', type: 'bigint' })
  id: number;

  /** sensorId (예: GL-0012) */
  @Column({ name: 'serial_number', type: 'varchar', length: 50, unique: true })
  serialNumber: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: number | null;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile> | null;

  /** 한 화분엔 센서 1개 (UQ). 연결 해제 시 NULL */
  @Column({ name: 'plant_id', type: 'bigint', nullable: true })
  plantId: number | null;

  @OneToOne(() => Plant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant> | null;

  @Column({ name: 'battery_level', type: 'smallint', nullable: true })
  batteryLevel: number | null;

  @Column({ name: 'report_interval_sec', type: 'integer', default: 600 })
  reportIntervalSec: number;

  @Column({ name: 'firmware_version', type: 'varchar', length: 20, nullable: true })
  firmwareVersion: string | null;

  /** 2시간 넘게 값이 없으면 오프라인 */
  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt: Date | null;

  @Column({ name: 'registered_at', type: 'timestamptz', nullable: true })
  registeredAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
