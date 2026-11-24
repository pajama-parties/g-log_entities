import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { WATERING_SOURCES, type WateringSource } from '../../enums.js';
import { Plant } from './plant.entity.js';

/** service_db.waterings — 물 준 기록 (PotSummary.watering 계산) */
@Entity({ name: 'waterings' })
@Index('idx_waterings_plant_watered', ['plantId', 'wateredAt'])
export class Watering {
  @PrimaryGeneratedColumn({ name: 'watering_id', type: 'bigint' })
  id: number;

  @Column({ name: 'plant_id', type: 'bigint' })
  plantId: number;

  @ManyToOne(() => Plant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant>;

  @Column({ name: 'watered_at', type: 'datetime' })
  wateredAt: Date;

  @Column({ name: 'moisture_before', type: 'tinyint', unsigned: true, nullable: true })
  moistureBefore: number | null;

  @Column({ name: 'moisture_after', type: 'tinyint', unsigned: true, nullable: true })
  moistureAfter: number | null;

  @Column({ type: 'enum', enum: WATERING_SOURCES, default: 'AUTO' })
  source: WateringSource;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
