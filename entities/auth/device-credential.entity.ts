import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** auth_db.device_credentials — 센서 인증 키. device_id는 service_db.devices와 논리 FK (1:1) */
@Entity({ name: 'device_credentials' })
export class DeviceCredential {
  @PrimaryColumn({ name: 'device_id', type: 'bigint' })
  deviceId: number;

  @Column({ name: 'api_key_hash', type: 'char', length: 64, unique: true, select: false })
  apiKeyHash: string;

  @CreateDateColumn({ name: 'issued_at', type: 'datetime' })
  issuedAt: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;
}
