import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { AUTH_TOKEN_PURPOSES, type AuthTokenPurpose } from '../../enums.js';
import { User } from './user.entity.js';

/** auth_db.auth_tokens — 이메일 인증·비밀번호 재설정 1회성 토큰 (스웨거에 아직 API 없음) */
@Entity({ name: 'auth_tokens' })
export class AuthToken {
  @PrimaryGeneratedColumn({ name: 'auth_token_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'enum', enum: AUTH_TOKEN_PURPOSES })
  purpose: AuthTokenPurpose;

  @Column({ name: 'token_hash', type: 'char', length: 64, unique: true })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
