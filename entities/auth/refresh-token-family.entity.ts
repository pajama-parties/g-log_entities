import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { User } from './user.entity.js';

/**
 * auth_db.refresh_token_families — 로그인 1번 = 패밀리 1개.
 * refresh 토큰을 돌려 쓸 때마다 같은 패밀리에 새 토큰이 붙고, 로그아웃·탈취 감지 시 패밀리째 revoked_at을 채움.
 */
@Entity({ name: 'refresh_token_families' })
@Index('idx_rtf_user', ['userId'])
export class RefreshTokenFamily {
  @PrimaryColumn({ name: 'family_id', type: 'varchar', length: 64, charset: 'ascii', collation: 'ascii_bin' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  /** 이 시각 이후로는 아무리 돌려 써도 연장 불가 (refreshToken.absoluteTtl) */
  @Column({ name: 'expires_at', type: 'datetime', precision: 3 })
  expiresAt: Date;

  /** 로그아웃·전체 로그아웃·재사용(탈취) 감지 시각 */
  @Column({ name: 'revoked_at', type: 'datetime', precision: 3, nullable: true })
  revokedAt: Date | null;
}
