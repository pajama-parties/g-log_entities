import { AuthToken } from './auth-token.entity.js';
import { DeviceCredential } from './device-credential.entity.js';
import { LoginHistory } from './login-history.entity.js';
import { OAuthAccount } from './oauth-account.entity.js';
import { RefreshTokenFamily } from './refresh-token-family.entity.js';
import { RefreshToken } from './refresh-token.entity.js';
import { User } from './user.entity.js';

export { AuthToken, DeviceCredential, LoginHistory, OAuthAccount, RefreshToken, RefreshTokenFamily, User };

/** auth 스키마 엔티티 */
export const AUTH_ENTITIES = [User, OAuthAccount, RefreshTokenFamily, RefreshToken, AuthToken, DeviceCredential, LoginHistory];
