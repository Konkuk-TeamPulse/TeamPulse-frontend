# TeamPulse Frontend

TeamPulse의 프론트엔드(React + Vite + TypeScript).

- 운영 배포: https://team-pulse-frontend.vercel.app
- 백엔드 API: https://teampulse-api.duckdns.org
- Backend repo: https://github.com/Konkuk-TeamPulse/TeamPulse-backend

## 환경변수

`.env.example`을 복사하여 `.env`를 생성한다.

```env
VITE_API_BASE_URL=https://teampulse-api.duckdns.org
```

로컬 백엔드와 함께 띄울 때는 `VITE_API_BASE_URL=http://localhost:8080`으로 변경한다.

## 로컬 실행

```powershell
npm install
npm run dev
```

기본 포트 `5173`. 브라우저에서 `http://localhost:5173` 접속.

## 빌드

```powershell
npm run build
```

`tsc -b && vite build`가 실행되며 산출물은 `dist/`에 생성된다. `npm run preview`로 프로덕션 빌드를 로컬에서 확인할 수 있다.

## 린트

```powershell
npm run lint
```

## 배포

main 브랜치에 push하면 Vercel Git 연동이 자동으로 빌드/배포한다. SPA 라우팅은 `vercel.json`의 rewrite 설정으로 처리된다 (`/(.*) -> /index.html`).

## 디렉터리 구조

- `src/` 화면, 컴포넌트, hooks, lib
- `src/lib/risk-engine.ts` 리스크 신호 클라이언트 계산
- `src/components/` UI 컴포넌트
- `public/` 정적 자산

## 기술 스택

- React 19, TypeScript 5.9
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- ESLint (flat config, typescript-eslint)
