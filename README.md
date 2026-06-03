# TeamPulse Frontend

TeamPulse의 프론트엔드(React + Vite + TypeScript).

- 운영 배포: https://team-pulse-frontend.vercel.app
- 백엔드 API: https://teampulse-api.duckdns.org
- Backend repo: https://github.com/Konkuk-TeamPulse/TeamPulse-backend

---

# TeamPulse

팀 프로젝트 협업과 일정 관리를 위한 웹 서비스입니다.

프로젝트 생성, 팀원 초대, 태스크 관리, 회의록, 리스크 확인, 리포트 다운로드 기능을 제공하여
팀 단위 협업을 효율적으로 지원합니다.

---

# 주요 기능

- 회원가입 / 로그인
- 프로젝트 생성 및 관리
- 팀원 초대 링크 생성 및 초대 수락
- 팀원 목록 조회 및 팀 탈퇴
- 태스크 생성 / 수정 / 삭제 / 상태 변경
- 태스크 의존관계 관리
- 회의록 생성 / 목록 조회 / 상세 조회
- 대시보드 조회
- 활동 로그 조회
- 리스크 신호 조회
- 프로젝트 리포트 생성 및 PDF 다운로드

---

## 배포 웹사이트 실행

https://team-pulse-frontend.vercel.app
위 사이트에서 바로 접속하여 사용 가능하다.

## 로컬 실행

# 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 로컬 백엔드 주소를 설정한다.

```bash
cp .env.example .env
```

Windows PowerShell에서는 아래 명령을 사용할 수 있다.

```powershell
Copy-Item .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8080
```

로컬 백엔드와 함께 띄울 때는 `VITE_API_BASE_URL=http://localhost:8080`을 사용한다. 운영 백엔드에 붙일 때는 `https://teampulse-api.duckdns.org`로 설정한다.

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
- Backend: http://localhost:8080

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
