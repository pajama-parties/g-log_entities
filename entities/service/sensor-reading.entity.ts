import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { MOISTURE_STATUSES, type MoistureStatus } from '../../enums.js';
import { Device } from './device.entity.js';
import { Plant } from './plant.entity.js';

/** service.sensor_readings — 측정값 원본 (hourly·weekly 그래프) */
@Entity({ schema: 'service', name: 'sensor_readings' })
@Index('idx_readings_plant_measured', ['plantId', 'measuredAt'])
export class SensorReading {
  @PrimaryGeneratedColumn({ name: 'reading_id', type: 'bigint' })
  id: number;

  @Column({ name: 'device_id', type: 'bigint' })
  deviceId: number;

  @ManyToOne(() => Device, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'device_id' })
  device: Relation<Device>;

  /** 측정 당시 연결된 화분 */
  @Column({ name: 'plant_id', type: 'bigint' })
  plantId: number;

  @ManyToOne(() => Plant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant>;

  @Column({ name: 'moisture_percent', type: 'smallint' })
  moisturePercent: number;

  @Column({ type: 'enum', enum: MOISTURE_STATUSES, enumName: 'moisture_status' })
  status: MoistureStatus;

  @Column({ name: 'battery_level', type: 'smallint', nullable: true })
  batteryLevel: number | null;

  @Column({ name: 'measured_at', type: 'timestamptz' })
  measuredAt: Date;

  @Column({ name: 'received_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;
}
