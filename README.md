# g-log DB schema

g-log 백엔드가 쓰는 **TypeORM 엔티티 · 코드값 · 마이그레이션**. 백엔드 레포에 git 서브모듈로 들어갑니다 (`backend/src/database/schema`).

```
entities/auth/      auth_db    (users, oauth_accounts, refresh_token_families, refresh_tokens, auth_tokens, device_credentials, login_history)
entities/service/   service_db (user_profiles, plants, devices, ..., comments)
enums.ts            DB에 저장하는 코드값 (OK/DRY/WET 등)
migrations/auth/    auth_db 마이그레이션
migrations/service/ service_db 마이그레이션
```

- `typeorm` 1.x가 필요합니다 (가져다 쓰는 프로젝트의 node_modules에서 찾음). ESM이라 상대 import는 `.js`로 끝납니다.
- 두 DB 사이(user_id, device_id)는 실제 FK가 없는 논리 FK입니다.
- 테이블은 `synchronize`가 아니라 마이그레이션으로만 바꿉니다. 엔티티를 고치면 같은 커밋에 마이그레이션도 넣으세요.
- TypeORM은 MySQL `CHECK` 제약을 자동 생성하지 않습니다. `plants`의 CHECK는 `InitService`에 직접 넣어 두었습니다.

## 백엔드에서 바꿀 때

```bash
cd backend/src/database/schema
git checkout main && git pull        # 서브모듈은 처음엔 특정 커밋에 고정(detached)돼 있음
# 엔티티 수정 → (backend 폴더에서) npm run migration:generate:service -- src/database/schema/migrations/service/AddSomething
git add . && git commit -m "..." && git push
cd ../../../..                        # 레포 루트
git add backend/src/database/schema   # 백엔드가 새 커밋을 가리키도록
git commit -m "chore: schema 서브모듈 업데이트"
```
