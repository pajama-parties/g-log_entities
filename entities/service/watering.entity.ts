import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { WATERING_SOURCES, type WateringSource } from '../../enums.js';
import { Plant } from './plant.entity.js';

/** service.waterings — 물 준 기록 (PotSummary.watering 계산) */
@Entity({ schema: 'service', name: 'waterings' })
@Index('idx_waterings_plant_watered', ['plantId', 'wateredAt'])
export class Watering {
  @PrimaryGeneratedColumn({ name: 'watering_id', type: 'bigint' })
  id: number;

  @Column({ name: 'plant_id', type: 'bigint' })
  plantId: number;

  @ManyToOne(() => Plant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: Relation<Plant>;

  @Column({ name: 'watered_at', type: 'timestamptz' })
  wateredAt: Date;

  @Column({ name: 'moisture_before', type: 'smallint', nullable: true })
  moistureBefore: number | null;

  @Column({ name: 'moisture_after', type: 'smallint', nullable: true })
  moistureAfter: number | null;

  @Column({ type: 'enum', enum: WATERING_SOURCES, enumName: 'watering_source', default: 'AUTO' })
  source: WateringSource;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
