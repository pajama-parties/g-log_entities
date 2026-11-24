/**
 * DB에 저장하는 코드값. 화면(스웨거) 문구로 바꾸는 표는 DB설계_ERD_v2.xlsx 개요 9번.
 */
export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const OAUTH_PROVIDERS = ['KAKAO'] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const AUTH_TOKEN_PURPOSES = ['EMAIL_VERIFY', 'PASSWORD_RESET'] as const;
export type AuthTokenPurpose = (typeof AUTH_TOKEN_PURPOSES)[number];

export const LOGIN_METHODS = ['EMAIL', 'KAKAO'] as const;
export type LoginMethod = (typeof LOGIN_METHODS)[number];

/** 측정 판정. 화면의 '오프라인', '수집 대기'는 저장하지 않고 계산 */
export const MOISTURE_STATUSES = ['OK', 'DRY', 'WET'] as const;
export type MoistureStatus = (typeof MOISTURE_STATUSES)[number];

export const WATERING_SOURCES = ['AUTO', 'MANUAL'] as const;
export type WateringSource = (typeof WATERING_SOURCES)[number];

export const NOTICE_TONES = ['DRY', 'WET', 'OK', 'OFFLINE', 'ADVICE', 'INFO'] as const;
export type NoticeTone = (typeof NOTICE_TONES)[number];

export const ADVICE_TONES = ['DRY', 'WET', 'OK', 'OFFLINE'] as const;
export type AdviceTone = (typeof ADVICE_TONES)[number];

export const POST_CATEGORIES = ['QUESTION', 'RECORD', 'TIP'] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const CHART_PERIODS = ['24H', '7D'] as const;
export type ChartPeriod = (typeof CHART_PERIODS)[number];

export const POT_COLORS = ['#304d42', '#527860', '#8a6f43', '#607b93', '#8b6e76'] as const;
export type PotColor = (typeof POT_COLORS)[number];
