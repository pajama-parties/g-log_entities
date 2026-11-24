import { Advice } from './advice.entity.js';
import { Comment } from './comment.entity.js';
import { DevicePairingCode } from './device-pairing-code.entity.js';
import { Device } from './device.entity.js';
import { Notification } from './notification.entity.js';
import { Plant } from './plant.entity.js';
import { PostAttachment } from './post-attachment.entity.js';
import { PostLike } from './post-like.entity.js';
import { Post } from './post.entity.js';
import { SensorReading } from './sensor-reading.entity.js';
import { UserProfile } from './user-profile.entity.js';
import { Watering } from './watering.entity.js';

export {
  Advice,
  Comment,
  Device,
  DevicePairingCode,
  Notification,
  Plant,
  Post,
  PostAttachment,
  PostLike,
  SensorReading,
  UserProfile,
  Watering,
};

/** service_db 엔티티 (기본 연결) */
export const SERVICE_ENTITIES = [
  UserProfile,
  Plant,
  Device,
  DevicePairingCode,
  SensorReading,
  Watering,
  Notification,
  Advice,
  Post,
  PostAttachment,
  PostLike,
  Comment,
];
