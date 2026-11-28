import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation } from 'typeorm';
import { Device } from '../service/device.entity.js';

/** auth.device_credentials — 센서 인증 키. device_id는 service.devices를 가리키는 FK (1:1) */
@Entity({ schema: 'auth', name: 'device_credentials' })
export class DeviceCredential {
  @PrimaryColumn({ name: 'device_id', type: 'bigint' })
  deviceId: number;

  @OneToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Relation<Device>;

  @Column({ name: 'api_key_hash', type: 'char', length: 64, unique: true, select: false })
  apiKeyHash: string;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;
}
