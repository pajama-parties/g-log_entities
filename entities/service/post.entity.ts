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
import { POST_CATEGORIES, type PostCategory } from '../../enums.js';
import { UserProfile } from './user-profile.entity.js';

/** service_db.posts — 커뮤니티 글. 응답 id는 문자열로 변환 */
@Entity({ name: 'posts' })
@Index('idx_posts_created', ['createdAt'])
@Index('idx_posts_category_created', ['category', 'createdAt'])
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  @Column({ type: 'enum', enum: POST_CATEGORIES })
  category: PostCategory;

  /** NULL이면 응답에 '공통' */
  @Column({ type: 'varchar', length: 20, nullable: true })
  crop: string | null;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'like_count', type: 'int', unsigned: true, default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', unsigned: true, default: 0 })
  commentCount: number;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
