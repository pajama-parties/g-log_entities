import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { RefreshTokenFamily } from './refresh-token-family.entity.js';
import { User } from './user.entity.js';

/** auth.refresh_tokens — refresh 토큰. 원문 대신 SHA-256만 저장, 한 번 쓰면 used_at이 채워짐 */
@Entity({ schema: 'auth', name: 'refresh_tokens' })
@Index('idx_rt_family', ['familyId'])
export class RefreshToken {
  /** 토큰의 SHA-256 */
  @PrimaryColumn({ name: 'token_hash', type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'family_id', type: 'varchar', length: 64 })
  familyId: string;

  @ManyToOne(() => RefreshTokenFamily, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family: Relation<RefreshTokenFamily>;

  /** 조회 편의용 (패밀리에도 있음) */
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'created_at', type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', precision: 3 })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', precision: 3, nullable: true })
  usedAt: Date | null;

  /** 로그인 때 정해진 클레임(amr, auth_time 등) */
  @Column({ type: 'jsonb', nullable: true })
  claims: Record<string, unknown> | null;
}
