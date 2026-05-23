# TeamPulse Frontend

TeamPulse의 프론트엔드(React + Vite + TypeScript).

- 운영 배포: https://team-pulse-frontend.vercel.app
- 백엔드 API: https://teampulse-api.duckdns.org
- Backend repo: https://github.com/Konkuk-TeamPulse/TeamPulse-backend

---

# TeamPulse

팀 프로젝트 협업과 일정 관리를 위한 웹 서비스입니다.

프로젝트 생성, 팀원 초대, 일정 및 출근 관리 기능을 제공하여
팀 단위 협업을 효율적으로 지원합니다.

---

# 주요 기능

- 회원가입 / 로그인
- 프로젝트 생성 및 관리
- 초대 링크 기반 팀원 초대
- 일정 관리
- 출근 예정 / 출근 완료 관리
- 팀원 관리
- 알림 기능
- 마이페이지

---

## 배포 웹사이트 실행

https://team-pulse-frontend.vercel.app
위 사이트에서 바로 접속하여 사용 가능하다.

## 로컬 실행

# 환경 변수 설정

`.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```
로컬 백엔드와 함께 띄울 때는 env파일에서 `VITE_API_BASE_URL=http://localhost:8080`으로 변경한다.

# 설치 및 실행 방법 1 (클론)

## Frontend

```bash
git clone https://github.com/Konkuk-TeamPulse/TeamPulse-frontend.git

cd TeamPulse-frontend

npm install

npm run dev
```

# 설치 및 실행 방법 2 (zip파일)

## Frontend
파일을 다운로드하고 압축을 푼 후 해당 최상위 폴더를 경로로 하여 위와 같이 동일하게 실행한다.

```bash
npm install

npm run dev
```
---

# 팀원 소개

| 이름 | 역할 |
| --- | --- |
| 박태희 | Frontend |
| 한지훈 | Backend, DB관리자 |
| 이주호 | Backend, PM |

---

# 로컬테스트시 프론트와 백의 url

- Frontend: http://localhost:5173/
- Backend:

---

# API 문서

- Notion: https://river-horse-2b8.notion.site/API-343ca66e3d8680f2bdaae20f6b084d32?source=copy_link

## 배포

main 브랜치에 push하면 Vercel Git 연동이 자동으로 빌드/배포한다. SPA 라우팅은 `vercel.json`의 rewrite 설정으로 처리된다 (`/(.*) -> /index.html`).


## 기술 스택

- React 19, TypeScript 5.9
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- ESLint (flat config, typescript-eslint)
