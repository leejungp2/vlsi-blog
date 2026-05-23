# Smart Blog

> GitHub 활동을 분석해 개발 블로그 초안을 자동으로 생성하는 서비스.
> AI를 활용한 실무 front-end 개발(2026) 11주차 미션 — 2주 프로젝트.

상세 기획·설계 문서는 [PLAN.md](./PLAN.md) 참고.

---

## 디렉토리 구조

```
260517/
├─ PLAN.md           # 주차별 계획 + 도구/데이터/컴포넌트/상태/인터랙션 설계
├─ README.md         # 이 문서
├─ package.json      # 모노레포 루트 (편의 스크립트만)
├─ .gitignore
├─ client/           # Vite + React (포트 5173)
└─ server/           # Express (포트 4000)
```

---

## 실행 방법

### 1) 의존성 설치 (한 번만)

루트에서 한 번에:

```bash
npm run install:all
```

또는 각각:

```bash
npm --prefix server install
npm --prefix client install
```

### 2) 환경 변수 설정 (2주차에 본격 사용)

```bash
cp server/.env.example server/.env
# 그 다음 server/.env 를 열어 GITHUB_TOKEN, OPENAI_API_KEY 채우기
```

`.env` 파일은 `.gitignore`에 포함되어 있어 절대 commit되지 않음.
실제 토큰은 본인 계정에서 직접 발급:
- GitHub PAT: https://github.com/settings/tokens
- OpenAI API Key: https://platform.openai.com/api-keys

### 3) 개발 서버 실행

**터미널 2개**를 띄워서 각각 실행:

```bash
# 터미널 1 — Express 서버 (포트 4000)
npm run dev:server

# 터미널 2 — Vite 클라이언트 (포트 5173)
npm run dev:client
```

브라우저로 http://localhost:5173 접속.

---

## 동작 확인 (1주차 완료 기준)

화면을 열었을 때 다음이 보이면 1주차 셋업이 정상입니다:

- 헤더: **Smart Blog** 제목과 부제
- 본문 박스 "서버 연결 상태"에 **초록색 JSON** 응답
  ```json
  {
    "status": "ok",
    "service": "smart-blog-server",
    "time": "2026-..."
  }
  ```

연결 실패 시 빨간 박스로 에러가 표시됩니다. 가장 흔한 원인은 Express 서버를 띄우지 않은 것 — 터미널 1을 다시 확인하세요.

curl로도 확인 가능:

```bash
curl http://localhost:4000/api/health        # Express 직접
curl http://localhost:5173/api/health        # Vite proxy 경유
```

둘 다 동일한 응답이 떨어져야 합니다.

---

## 기술 스택 (1주차 셋업 시점)

| 영역 | 도구 | 비고 |
|---|---|---|
| FE | Vite + React 19 | dev: `vite`, build: `vite build` |
| BE | Express 4 (ESM) | dev: `node --watch` (외부 nodemon 불필요) |
| 환경 변수 | dotenv | `server/.env` |
| 통신 | fetch + Vite proxy | 클라이언트는 `/api/*`만 사용 |

선정 이유는 [PLAN.md §2](./PLAN.md#2-도구-선정과-이유) 참고.

---

## 진행 현황

- [x] 1주차: 기획·설계 + 모노레포 스캐폴딩 + 헬스 체크
- [x] 2주차: GitHub API 연동 → commit 선택 → LLM 요약 → 저장/편집/카드 목록
