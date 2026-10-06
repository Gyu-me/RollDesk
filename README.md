# RollDesk

TRPG 시나리오를 구조화하고 준비해 실제 세션에서 실행하기 위한 웹 기반 시나리오 워크스페이스입니다.

## Overview

RollDesk는 시나리오 원문을 문장과 문단 단위로 구조화하고 태그, 스타일, 매크로, 분기와 루트를 관리하는 작업 흐름을 하나로 연결합니다. 출력 데이터는 특정 플랫폼에 종속시키지 않고 Transformer를 통해 Roll20, CCFOLIA 등의 형식으로 확장할 예정입니다.

## Tech Stack

- Next.js, React, TypeScript
- Tailwind CSS, shadcn/ui, lucide-react
- Zustand, Zod, next-themes
- CodeMirror 6, dnd-kit, Dexie
- Vitest, React Testing Library, Playwright
- ESLint, Prettier, Husky, lint-staged

## Getting Started

```bash
pnpm install
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## Scripts

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
- `pnpm lint`: ESLint 검사
- `pnpm typecheck`: TypeScript 타입 검사
- `pnpm test`: 단위·컴포넌트 테스트 실행
- `pnpm test:watch`: 테스트 감시 모드
- `pnpm test:e2e`: Playwright E2E 테스트
- `pnpm format`: Prettier 포맷 적용
- `pnpm format:check`: 포맷 검사

## Project Structure

- `src/app`: App Router 페이지, 레이아웃, 전역 스타일
- `src/components`: 공통 UI와 테마 컴포넌트
- `src/features`: 기능별 모듈이 필요해질 때 확장
- `src/lib`: 저장, 파싱, Transformer 등 공통 로직
- `docs`: 제품, 아키텍처, 도메인, 로드맵 문서
- `tests/e2e`: Playwright E2E 테스트

## Status

Initial Setup — 장기 개발을 위한 기반 환경을 구성하는 단계입니다. 시나리오 편집, 로그인, 데이터베이스, 커뮤니티 기능은 아직 구현하지 않았습니다.

## Roadmap

다음 단계에서는 Scenario와 ScriptLine 도메인 모델, 안전한 로컬 저장, 편집 워크플로를 순차적으로 구현합니다. 자세한 내용은 `docs/roadmap.md`를 참고하세요.
