# CLAUDE.md

AI를 활용한 실무 front-end 개발(2026) 11주차 미션 — **스마트블로그 서비스**.
GitHub 활동을 LLM이 분석해 개발 블로그 초안을 자동 생성하는 2주짜리 프로젝트.

## 프로젝트 구조

모노레포 — `client/` (Vite + React, 포트 5173) + `server/` (Express, 포트 4000).

- 상세 기획·설계: `PLAN.md`
- 실행 방법: `README.md`

## 개발 명령어

```bash
# 의존성 (최초 1회)
npm run install:all

# 개발 서버 (터미널 2개)
npm run dev:server   # Express :4000
npm run dev:client   # Vite :5173
```

## 핵심 컨벤션

- **외부 API 호출은 모두 Express 경유** — GitHub/OpenAI 토큰을 브라우저에 노출하지 않기 위함
- `.env`는 `.gitignore` 대상, `server/.env.example`만 commit
- 클라이언트의 API 호출은 `client/src/api/client.js` 래퍼만 사용 (`/api/*` 경로)
- 한 commit = 한 관심사. PR 메시지는 개조식 짧게

## 진행 현황

- [x] 1주차: 기획·설계 + 모노레포 스캐폴딩 + 헬스 체크
- [ ] 2주차: GitHub API 연동 → commit 선택 → LLM 요약 → 저장/편집/카드 목록

## Git 셋업

- origin: 본인 fork (`leejungp2/vlsi-blog`)
- upstream: 운영 리포 (`boostcampwm-snu-2026-1/commit-to-blog`)
- 작업 브랜치: `leejungp2` (upstream/leejungp2를 베이스로 함)
- PR base: `boostcampwm-snu-2026-1/commit-to-blog:leejungp2`
