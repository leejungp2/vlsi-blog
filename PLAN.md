# 스마트블로그 서비스 - 개발 계획

> GitHub 활동(commit/branch)을 LLM이 분석해 자동으로 개발 블로그 초안을 생성하는 서비스.
> 2주차 미션으로 진행되며, 이 문서는 **1주차 기획·설계**의 결과물입니다.

---

## 1. 주차별 계획

### 1주차 (이번 주) — 기획구체화 & 설계 & 스캐폴딩
- 요구사항 분석 및 본 문서(`PLAN.md`) 작성
- 도구/스택 확정과 그 이유 정리
- 디렉토리 구조와 데이터 모델 설계
- 모노레포 스캐폴딩: `client/` (Vite + React), `server/` (Express)
- 클라이언트 ↔ 서버 통신 검증용 헬스 체크 라우트 (`/api/health`)
- 환경변수 운용 규칙(`.env`, `.env.example`) 셋업

### 2주차 — 기능 개발
- (1) **블로그 생성**: GitHub repo 리스트 → branch/commit 선택 → LLM 요약
- (2) **편집기**: 생성된 초안을 사용자가 수정·보완
- (3) **저장된 포스트**: 카드형 목록, 재편집/발행
- 인터랙션 다듬기, 에러 처리, 간이 테스트

---

## 2. 도구 선정과 이유

| 영역 | 선택 | 이유 |
|---|---|---|
| FE 빌드 | **Vite + React** | dev 서버가 가볍고 HMR이 빠르며 설정이 단순함. 과제 규모에 맞고 학습 부담이 적음 |
| BE | **Express** | 명세에서 "GitHub API 요청은 Express 기반 서버에서"라고 명시. 라우팅이 직관적 |
| HTTP | **fetch (Web/Node)** | 외부 의존 최소화. 학습 키워드에도 `fetch` 포함 |
| GitHub API | **@octokit/rest** (2주차 도입 예정) | 공식 SDK로 인증·에러·페이지네이션을 안전하게 처리 |
| LLM | **openai SDK** (2주차 도입 예정) | `chat/completions` 호출이 명세 아키텍처와 정확히 일치 |
| 환경변수 | **dotenv** | 토큰을 코드에 박지 않고 `.env`로 분리. `.env.example`만 커밋 |
| 개발 프록시 | **Vite proxy (`/api`)** | CORS 회피와 production-like한 경로 일원화 |
| 데이터 보관 | **in-memory(Map/Array)** | 1주차 범위에서는 충분. 2주차에 JSON 파일 또는 SQLite 도입 검토 |

> **선정 기준**: ① 명세 요구와의 부합 ② 과제 규모에 비례한 학습 비용 ③ 토큰/시크릿 안전 처리.

---

## 3. 구현 범위 (Scope)

### Must (필수)
- [x] GitHub repo 리스트 조회
- [x] 선택한 repo의 branch 리스트 조회
- [x] 선택한 branch의 최근 commit 리스트 조회
- [x] 선택한 commit들에 대해 LLM 요약 → 블로그 초안 생성
- [x] 초안을 사용자가 편집할 수 있는 에디터
- [x] 작성한 포스트 저장 (브랜치 태그, 요약, 날짜 포함)
- [x] 저장된 포스트 카드형 목록
- [x] 저장된 포스트 재편집/발행

### Should (가능하면)
- [x] commit 다중 선택 UI
- [x] 요약 톤(개발자 회고/리뷰/튜토리얼) 옵션
- [x] 로딩/에러 상태 UI

### Won't (이번 2주에는 X)
- 실제 외부 블로그 플랫폼 게시 (Velog, Tistory 등)
- 다중 사용자 인증/로그인
- 영구 데이터베이스

---

## 4. 데이터 구조

서버에서 다룰 핵심 도메인 객체:

```ts
// GitHub에서 받아오는 raw 자료 (변형 없이 클라이언트로 전달)
Repository { id, name, full_name, private, default_branch, updated_at }
Branch     { name, commit: { sha } }
Commit     { sha, message, author: { name, date }, html_url }
CommitDetail extends Commit { files: [{ filename, patch, additions, deletions }] }

// 우리가 만드는 도메인 객체
DraftRequest {
  repoFullName: string         // "user/repo"
  branch: string
  commitShas: string[]
  tone?: "review" | "tutorial" | "retrospective"
}

Post {
  id: string                   // uuid
  title: string
  body: string                 // markdown
  branchTag: string            // 카드에 보이는 태그 (예: "main", "feature/x")
  summaryPreview: string       // 앞부분 120자
  createdAt: string            // ISO
  updatedAt: string
  status: "draft" | "published"
  sourceCommits: string[]      // sha 배열
}
```

저장 위치: **1주차는 서버 메모리(`Map<id, Post>`)**, 2주차에 영속화 검토.

---

## 5. 컴포넌트 / 디렉토리 구조

### 루트 (모노레포)
```
260517/
├─ PLAN.md
├─ README.md
├─ .gitignore
├─ client/                 # Vite + React
└─ server/                 # Express
```

### `client/` (React 기준)
```
client/
├─ index.html
├─ vite.config.js          # /api proxy → http://localhost:4000
├─ package.json
└─ src/
   ├─ main.jsx
   ├─ App.jsx              # 라우팅 컨테이너 (My Blog / Saved Posts / Settings)
   ├─ api/
   │  └─ client.js         # fetch 래퍼 (baseURL: "/api")
   ├─ pages/
   │  ├─ MyBlogPage.jsx    # 포스트 작성 (저장소/브랜치/커밋 선택 + 에디터)
   │  ├─ SavedPostsPage.jsx# 카드형 목록
   │  └─ SettingsPage.jsx
   ├─ components/
   │  ├─ Header.jsx
   │  ├─ RepoPicker.jsx
   │  ├─ BranchPicker.jsx
   │  ├─ CommitList.jsx
   │  ├─ DraftEditor.jsx
   │  └─ PostCard.jsx
   └─ styles/
      └─ tokens.css        # 색/타이포/간격 변수
```

### `server/` (Express 기준)
```
server/
├─ package.json
├─ .env.example
└─ src/
   ├─ index.js             # 진입점 (express 인스턴스, listen)
   ├─ routes/
   │  ├─ health.js         # GET /api/health
   │  ├─ github.js         # GET /api/github/repos, /branches, /commits  (2주차)
   │  ├─ draft.js          # POST /api/draft  → LLM 요약               (2주차)
   │  └─ posts.js          # CRUD on Post                              (2주차)
   ├─ services/
   │  ├─ githubService.js  # @octokit 호출 (2주차)
   │  └─ llmService.js     # openai 호출 (2주차)
   ├─ store/
   │  └─ postStore.js      # in-memory Map (2주차)
   └─ middleware/
      └─ errorHandler.js
```

---

## 6. 상태 흐름

### 화면 흐름
```
[Header: My Blog | Saved Posts | Settings]
   │
   ├─ My Blog ─── RepoPicker → BranchPicker → CommitList(다중선택)
   │               │
   │               └─▶ "요약 생성" 버튼 → DraftEditor (LLM 결과 채워짐)
   │                                       │
   │                                       └─▶ "저장 및 게시" → Saved Posts로 이동
   │
   └─ Saved Posts ─ PostCard[] → "수정하기" / "발행하기"
```

### 데이터 흐름
```
[Browser]  사용자 입력 (repo, branch, sha[])
   │ fetch POST /api/draft  { repoFullName, branch, commitShas, tone }
   ▼
[Express]  githubService.getCommitDetails(sha[]) → diff 추출
   │       llmService.summarize({ commits, diffs, tone })
   ▼
[OpenAI]   chat/completions
   │
[Express]  → JSON { title, body, ... } 응답
   ▼
[Browser]  DraftEditor 상태 갱신 → 사용자 편집 → POST /api/posts 저장
```

> 핵심 원칙: **모든 외부 API 호출은 Express 서버를 경유.** 토큰이 브라우저에 노출되지 않도록 함.

---

## 7. 데이터 보관 전략

| 항목 | 1주차 | 2주차 검토 |
|---|---|---|
| 저장된 포스트 | 서버 메모리 `Map<id, Post>` | `data/posts.json` 파일 또는 SQLite |
| GitHub 응답 | 캐싱 없음 | 짧은 TTL 메모리 캐시(레이트리밋 보호) |
| 토큰 | `.env`만, 절대 commit X | 동일 |

서버를 재시작하면 포스트가 사라지는 한계는 1주차 범위에서는 수용. 2주차에 영속화 결정.

---

## 8. 주요 인터랙션

| # | 인터랙션 | 기대 동작 |
|---|---|---|
| I1 | repo 선택 | 자동으로 default branch 로딩되며 commit 리스트가 채워짐 |
| I2 | branch 변경 | commit 리스트가 새로 fetch됨 (이전 선택 유지 X) |
| I3 | commit 다중 선택 | 체크박스 또는 클릭 토글, 선택된 sha를 우측 패널에 미리 표시 |
| I4 | "요약 생성" | 로딩 인디케이터 → 결과를 에디터에 채움. 실패 시 에러 메시지 |
| I5 | 에디터 편집 | 마크다운으로 자유 편집 가능. 글자 수 표시 |
| I6 | "저장 및 게시" | 서버에 POST → 성공 시 Saved Posts 화면으로 이동, 카드로 노출 |
| I7 | 카드 "수정하기" | 에디터 모달/페이지로 진입, draft 상태로 되돌림 |
| I8 | 카드 "발행하기" | status=published로 변경, 시각적으로 구분 (1주차는 UI만) |

---

## 9. 테스트 / 검증 방식

### "구현 완료"의 정의
- 위 인터랙션 I1~I8이 키보드/마우스로 손-테스트(hand-test)에서 모두 동작
- 잘못된 입력(빈 commit 선택, 네트워크 에러)에서도 앱이 죽지 않음
- 토큰이 git에 들어가지 않음 (`.gitignore` 확인)

### 검증 방법
- **수동 시나리오 테스트** — 위 I1~I8을 시나리오 문서로 정리해 매 PR마다 직접 클릭
- **서버 라우트 smoke test** — `curl`로 `/api/health`, `/api/github/repos` 확인
- **로그 확인** — 서버 콘솔에 요청/오류가 명확히 보이도록 미들웨어로 로깅
- 2주차 후반에 여유 있으면 핵심 함수(`summarizePrompt` 등)에 한해 단위 테스트 추가 검토

---

## 10. API 연동 (보안 포함)

- GitHub API: Express에서만 호출, 토큰은 `process.env.GITHUB_TOKEN`
- LLM(OpenAI): Express에서만 호출, 키는 `process.env.OPENAI_API_KEY`
- `.env`는 `.gitignore`에 포함. `.env.example`만 commit하여 어떤 키가 필요한지 공유
- 브라우저는 **자체 fetch로 외부 API를 호출하지 않음.** 모든 외부 통신은 `/api/*` 경유

---

## 11. AI Workflow & 나만의 Skill (자기 회고)

명세에서 요구한 "AI workflow를 스스로 만들기"는 다음 패턴으로 진행:

1. **명세 → 설계 → commit 단위 plan**을 먼저 합의
2. commit 단위로 코드를 작성하면서 매번 **WHY를 한국어로 설명**
3. 사용자 확인 후 다음 commit으로 진행

이 과정을 패턴화한 `homework-skill`을 이미 운용 중이며, 본 과제도 그 흐름을 따른다. 2주차에 발견되는 추가 패턴(예: API 연동 디버깅 루틴)을 별도 Skill로 분리할지 검토.
