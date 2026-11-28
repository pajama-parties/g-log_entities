import { AUTH_ENTITIES } from './auth/index.js';
import { SERVICE_ENTITIES } from './service/index.js';

export { AUTH_ENTITIES, SERVICE_ENTITIES };

/**
 * PostgreSQL 한 DB의 전체 엔티티 (auth, service 스키마).
 * 두 스키마 사이에 실제 FK가 있으므로(user_profiles → users, device_credentials → devices) 한 DataSource에 함께 등록해야 함
 */
export const ENTITIES = [...AUTH_ENTITIES, ...SERVICE_ENTITIES];
