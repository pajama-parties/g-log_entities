import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { Post } from './post.entity.js';
import { UserProfile } from './user-profile.entity.js';

/** service_db.post_likes — 공감. (post_id, user_id) 복합 PK로 한 사람 1번 */
@Entity({ name: 'post_likes' })
export class PostLike {
  @PrimaryColumn({ name: 'post_id', type: 'bigint' })
  postId: number;

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Relation<Post>;

  @ManyToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserProfile>;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
