import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from '../../enums.js';

/** auth_db.users — 회원 계정 본체 (일반 사용자 + 관리자) */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'bigint' })
  id: number;

  /** 카카오 전용 회원은 NULL 가능, 탈퇴 시 NULL로 비움 */
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  /** 이메일 로그인 비밀번호 해시 (bcrypt/argon2id). 카카오 전용 회원은 NULL. 기본 조회에서 제외 */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash: string | null;

  @Column({ name: 'password_changed_at', type: 'datetime', nullable: true })
  passwordChangedAt: Date | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'enum', enum: USER_ROLES, default: 'USER' })
  role: UserRole;

  @Column({ type: 'enum', enum: USER_STATUSES, default: 'ACTIVE' })
  status: UserStatus;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  /** 탈퇴일 (소프트 삭제) */
  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
