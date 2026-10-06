# Architecture

## Current stack

- Next.js App Router, React, TypeScript
- Tailwind CSS, shadcn/ui, lucide-react
- next-themes, Zustand, Zod
- CodeMirror 6, dnd-kit, Dexie
- Vitest, React Testing Library, Playwright

## Structure

- `src/app`: 라우팅, 레이아웃, 전역 스타일
- `src/components`: 공통 UI와 shadcn/ui 컴포넌트
- `src/features`: 기능 단위 코드가 필요해질 때 추가
- `src/lib`: 파싱, 저장소, Transformer 등 재사용 가능한 로직
- `src/stores`: 실제 전역 상태가 필요해질 때 추가
- `src/types`: 공유 도메인 타입

서버 데이터, 영속 데이터, UI 상태를 분리한다. 현재 단계에서는 Supabase나 실제 IndexedDB 스키마를 구현하지 않는다.

## Security baseline

사용자 HTML과 매크로 코드는 신뢰하지 않는다. script 실행을 기본 허용하지 않으며, 향후 HTML Preview는 sanitize와 sandboxed iframe 같은 격리 방식을 전제로 설계한다. `dangerouslySetInnerHTML` 사용 전에는 XSS 방어 전략이 반드시 필요하다.
