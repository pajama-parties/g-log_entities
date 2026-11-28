# g-log DB schema

**TypeORM 엔티티, 코드값, 마이그레이션**을 담은 저장소로, g-log 백엔드가 씁니다. 백엔드 레포(auth 서버 `g-log_auth`, 서비스 API `g-log_web_API`)에 git 서브모듈로 들어갑니다 (`src/database/schema`).

```
entities/auth/      auth 스키마    (users, oauth_accounts, refresh_token_families, refresh_tokens, auth_tokens, device_credentials, login_history)
entities/service/   service 스키마 (user_profiles, plants, devices, ..., comments)
entities/index.ts   ENTITIES: 두 스키마의 엔티티 전체 (DataSource에 이 목록을 등록)
enums.ts            DB에 저장하는 코드값 (OK/DRY/WET 등)
migrations/         마이그레이션 (두 스키마 공통)
update-logs/        다른 프로젝트에 영향을 주는 변경 기록
```

- PostgreSQL DB 하나를 `auth`·`service` 스키마로 나눠 씁니다. 엔티티마다 `@Entity({ schema, name })`으로 스키마를 지정합니다.
- 두 스키마 사이에도 실제 FK가 있습니다: `service.user_profiles.user_id` → `auth.users`, `auth.device_credentials.device_id` → `service.devices`. 관계를 해석하려면 두 스키마의 엔티티가 한 DataSource에 함께 있어야 하므로 `ENTITIES`를 등록하세요.
- `typeorm` 1.x와 `pg`가 필요합니다 (가져다 쓰는 프로젝트의 node_modules에 설치된 것을 사용합니다). ESM이라 상대 import는 `.js`로 끝납니다.
- BIGINT id를 number로 받으려면 DataSource 옵션에 `parseInt8: true`를 넣으세요. 넣지 않으면 문자열로 옵니다.
- 테이블은 `synchronize`가 아니라 마이그레이션으로만 바꿉니다. 엔티티를 고치면 같은 커밋에 마이그레이션도 넣으세요.
- 여러 테이블이 함께 쓰는 enum 타입(`service.moisture_status`)은 마이그레이션 생성기가 중복으로 만들 수 있습니다. 생성된 SQL에서 `CREATE TYPE`·`DROP TYPE`이 두 번 나오지 않는지 확인하세요.

## 백엔드에서 스키마를 변경하는 절차

마이그레이션 생성·실행은 auth 서버(`g-log_auth`)에서 합니다.

```bash
cd src/database/schema
git checkout main && git pull        # 서브모듈은 처음엔 특정 커밋에 고정(detached)돼 있음
# 엔티티 수정 → g-log_auth 폴더에서 npm run migration:generate -- src/database/schema/migrations/AddSomething 실행 (이후 명령은 다시 src/database/schema에서 실행)
git add . && git commit -m "..." && git push
cd ../../..                           # 레포 루트
git add src/database/schema           # 백엔드가 새 커밋을 가리키도록
git commit -m "chore: schema 서브모듈 업데이트"
```
