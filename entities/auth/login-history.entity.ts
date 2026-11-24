import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { LOGIN_METHODS, type LoginMethod } from '../../enums.js';
import { User } from './user.entity.js';

/** auth_db.login_history — 로그인 시도 기록 */
@Entity({ name: 'login_history' })
export class LoginHistory {
  @PrimaryGeneratedColumn({ name: 'login_id', type: 'bigint' })
  id: number;

  /** 없는 이메일로 시도하면 NULL */
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @Column({ type: 'enum', enum: LOGIN_METHODS })
  method: LoginMethod;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Index('idx_login_history_created_at')
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
