import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, type Relation } from 'typeorm';
import { CHART_PERIODS, type ChartPeriod } from '../../enums.js';
import { Plant } from './plant.entity.js';
import { Post } from './post.entity.js';

/** service_db.post_attachments — 글에 고정한 그래프 (Post.attach). 글 1개당 0~1개 */
@Entity({ name: 'post_attachments' })
export class PostAttachment {
  @PrimaryColumn({ name: 'post_id', type: 'bigint' })
  postId: number;

  @OneToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Relation<Post>;

  /** attachPotId. 응답에 내보내지 않음 */
  @Column({ name: 'source_plant_id', type: 'bigint', nullable: true })
  sourcePlantId: number | null;

  @ManyToOne(() => Plant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'source_plant_id' })
  sourcePlant: Relation<Plant> | null;

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'enum', enum: CHART_PERIODS })
  period: ChartPeriod;

  /** 그 시점 hourly 또는 weekly 값 복사본 */
  @Column({ type: 'json' })
  points: number[];

  @Column({ name: 'lower_threshold', type: 'tinyint', unsigned: true })
  lowerThreshold: number;

  @Column({ name: 'upper_threshold', type: 'tinyint', unsigned: true })
  upperThreshold: number;
}
