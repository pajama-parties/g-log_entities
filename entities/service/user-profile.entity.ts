import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation } from 'typeorm';
import { User } from '../auth/user.entity.js';

/** service.user_profiles — 회원 프로필·알림 설정. user_id는 auth.users를 가리키는 FK (1:1) */
@Entity({ schema: 'service', name: 'user_profiles' })
export class UserProfile {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  /** 계정은 탈퇴해도 소프트 삭제라 행이 남음. 계정 행을 실제로 지우면 프로필도 함께 삭제 */
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  /** User.name / Post.author / Comment.author. 중복 허용 */
  @Column({ type: 'varchar', length: 30 })
  nickname: string;

  /** User.kakaoConsent — 카카오톡 메시지 전송 동의 */
  @Column({ name: 'kakao_consent', type: 'boolean', default: false })
  kakaoConsent: boolean;

  @Column({ name: 'kakao_consent_at', type: 'timestamptz', nullable: true })
  kakaoConsentAt: Date | null;

  /** NoticeSettings.dry / wet / offline / advice */
  @Column({ name: 'notify_dry', type: 'boolean', default: true })
  notifyDry: boolean;

  @Column({ name: 'notify_wet', type: 'boolean', default: true })
  notifyWet: boolean;

  @Column({ name: 'notify_offline', type: 'boolean', default: true })
  notifyOffline: boolean;

  @Column({ name: 'notify_advice', type: 'boolean', default: true })
  notifyAdvice: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
