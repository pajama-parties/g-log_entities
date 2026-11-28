# MySQL 두 DB에서 PostgreSQL 한 DB의 두 스키마로 전환

- **작성일**: 2026-11-28
- **작성 프로젝트**: g-log_auth
- **대상 프로젝트**: g-log_auth, g-log_web_API

## 변경 내용

MySQL의 `auth_db`·`service_db` 두 DB를 PostgreSQL DB 하나의 `auth`·`service` 스키마로 옮겼다. 두 DB 사이에서는 FK를 걸 수 없어서 `user_id`와 `device_id`를 논리 FK로 두었는데, 한 DB 안의 스키마 사이에는 FK를 걸 수 있으므로 실제 FK로 바꿨다.

| 컬럼 | 참조 대상 | 삭제 시 동작 |
|---|---|---|
| `service.user_profiles.user_id` | `auth.users` | CASCADE |
| `auth.device_credentials.device_id` | `service.devices` | CASCADE |
| `auth.refresh_tokens.user_id` | `auth.users` | CASCADE |

`auth.refresh_tokens.user_id`는 원래 같은 DB 안에 있었지만 FK 없이 조회용으로만 두었던 컬럼이어서, 이번 전환에서 함께 FK를 걸었다.

엔티티와 마이그레이션은 아래와 같이 바뀌었다.

- 엔티티마다 `@Entity({ schema: 'auth' | 'service', name })`으로 스키마를 지정함
- 컬럼 타입을 PostgreSQL 타입으로 바꿈: `datetime` → `timestamptz`, `tinyint unsigned` → `smallint`, `int unsigned` → `integer`, `varbinary` → `bytea`, `json` → `jsonb`
- enum 컬럼에 `enumName`을 지정함 (예: `service.moisture_status`)
- 두 스키마의 엔티티를 모은 `ENTITIES`를 `entities/index.ts`에 추가함
- MySQL 마이그레이션 4개(`InitAuth`, `JwtRefreshTokens`, `InitService`, `PlantThresholdDefault`)를 삭제하고 `migrations/1795852323070-InitPostgres.ts` 하나로 대체함. 마이그레이션 폴더도 `migrations/auth`·`migrations/service`에서 `migrations` 하나로 합침

MySQL에 있던 데이터는 옮기지 않는다. 새 PostgreSQL DB에 `InitPostgres`를 실행해서 빈 테이블부터 시작한다.

## 필요한 작업

두 프로젝트 모두 아래 작업이 필요하다.

- `mysql2` 대신 `pg` 패키지를 설치함
- DB 연결을 하나로 합침. `AUTH_CONNECTION` 연결을 없애고 `type: 'postgres'`, `parseInt8: true`, `entities: ENTITIES`로 기본 연결 하나만 만듦
- 환경 변수 `AUTH_DB_NAME`·`SERVICE_DB_NAME`을 `DB_NAME` 하나로 바꿈
- 중복 키 오류는 MySQL의 `ER_DUP_ENTRY` 대신 PostgreSQL의 `23505`(unique_violation)로 판별함

g-log_auth에서 할 작업은 아래와 같다.

- 가입할 때 계정과 프로필(`service.user_profiles`)을 트랜잭션 하나로 만듦. 로그인할 때마다 프로필이 없으면 만들던 처리는 FK 때문에 필요 없어져서 삭제함
- 탈퇴할 때 `auth`와 `service` 스키마의 변경을 트랜잭션 하나로 처리함
- DB별로 나뉘어 있던 마이그레이션 명령(`migration:generate:auth`·`migration:generate:service`, `migration:revert:auth`·`migration:revert:service`)을 `migration:generate`·`migration:revert`로 합침. `migration:run`·`migration:show`도 DB 하나만 대상으로 실행함
- 로컬 개발 DB를 도커 PostgreSQL 17로 바꿈 (포트 5433)

g-log_web_API에서 할 작업은 아래와 같다.

- 센서를 등록할 때 센서 토큰(`auth.device_credentials`) 저장을 등록 트랜잭션 안에서 처리함
- 커뮤니티 글 검색을 `LIKE`에서 `ILIKE`로 바꿈. PostgreSQL의 `LIKE`는 대소문자를 구분하므로, MySQL에서처럼 대소문자를 구분하지 않고 검색하려면 `ILIKE`를 써야 함
