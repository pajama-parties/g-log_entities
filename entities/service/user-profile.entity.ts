import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** service_db.user_profiles — 회원 프로필·알림 설정. user_id는 auth_db.users와 논리 FK (1:1) */
@Entity({ name: 'user_profiles' })
export class UserProfile {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  /** User.name / Post.author / Comment.author. 중복 허용 */
  @Column({ type: 'varchar', length: 30 })
  nickname: string;

  /** User.kakaoConsent — 카카오톡 메시지 전송 동의 */
  @Column({ name: 'kakao_consent', type: 'boolean', default: false })
  kakaoConsent: boolean;

  @Column({ name: 'kakao_consent_at', type: 'datetime', nullable: true })
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

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
