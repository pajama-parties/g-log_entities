import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { OAUTH_PROVIDERS, type OAuthProvider } from '../../enums.js';
import { User } from './user.entity.js';

/** auth_db.oauth_accounts — 카카오 연결 (POST /auth/kakao) */
@Entity({ name: 'oauth_accounts' })
@Index('uq_oauth_provider_user', ['provider', 'providerUserId'], { unique: true })
@Index('uq_oauth_user_provider', ['userId', 'provider'], { unique: true })
export class OAuthAccount {
  @PrimaryGeneratedColumn({ name: 'oauth_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'enum', enum: OAUTH_PROVIDERS })
  provider: OAuthProvider;

  /** 카카오 회원번호. 회원은 (provider, providerUserId)로만 찾음 */
  @Column({ name: 'provider_user_id', type: 'varchar', length: 100 })
  providerUserId: string;

  /** 참고용. 같아도 이메일 계정과 자동 병합하지 않음 */
  @Column({ name: 'provider_email', type: 'varchar', length: 255, nullable: true })
  providerEmail: string | null;

  /** 카카오톡 메시지 전송 동의자만 저장 (AES-GCM 암호문). 기본 조회에서 제외 */
  @Column({ name: 'access_token_enc', type: 'varbinary', length: 512, nullable: true, select: false })
  accessTokenEnc: Buffer | null;

  @Column({ name: 'refresh_token_enc', type: 'varbinary', length: 512, nullable: true, select: false })
  refreshTokenEnc: Buffer | null;

  @Column({ name: 'token_expires_at', type: 'datetime', nullable: true })
  tokenExpiresAt: Date | null;

  /** 응답 User.connectedAt */
  @CreateDateColumn({ name: 'linked_at', type: 'datetime' })
  linkedAt: Date;
}
