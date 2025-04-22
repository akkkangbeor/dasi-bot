# DASI Frontend

DASI(Discord AI Service Integration)의 프론트엔드 프로젝트입니다.

## 프로젝트 개요

DASI는 디스코드 봇과 AI 서비스를 통합하여 사용자에게 더 나은 경험을 제공하는 프로젝트입니다.

## 기술 스택

- TypeScript
- Node.js
- Discord.js
- Axios
- Cheerio
- Luxon

## 설치 및 실행 방법

1. 저장소를 클론합니다:
```bash
git clone [repository-url]
```

2. 의존성을 설치합니다:
```bash
pnpm install
```

3. `.env` 파일을 생성하고 다음 내용을 추가합니다:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

4. 개발 모드로 실행:
```bash
pnpm dev
```

5. 프로덕션 빌드 및 실행:
```bash
pnpm build
pnpm start
```

## 봇 초대 링크

봇을 서버에 초대하려면 아래 링크를 사용하세요:
```
https://discord.com/api/oauth2/authorize?client_id=1364088345902317608&permissions=1024&scope=bot%20applications.commands
```

## 주요 스크립트

- `pnpm dev`: 개발 모드로 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 실행
- `pnpm format`: 코드 포맷팅
- `pnpm format:check`: 코드 포맷팅 검사
- `pnpm deploy-commands`: 디스코드 명령어 배포

## 프로젝트 구조

- `src/`: 소스 코드
  - `commands/`: 디스코드 봇 명령어
  - `events/`: 이벤트 핸들러
  - `types/`: TypeScript 타입 정의
  - `index.ts`: 메인 진입점
- `dist/`: 컴파일된 JavaScript 파일
- `node_modules/`: 의존성 패키지

## 개발 가이드

### 명령어 추가하기

1. `src/commands/` 디렉토리에 새로운 명령어 파일을 생성합니다.
2. 명령어 로직을 구현합니다.
3. `pnpm deploy-commands`를 실행하여 명령어를 배포합니다.

### 이벤트 핸들러 추가하기

1. `src/events/` 디렉토리에 새로운 이벤트 핸들러 파일을 생성합니다.
2. 이벤트 처리 로직을 구현합니다.

## 코드 스타일

- Prettier를 사용하여 코드 포맷팅을 적용합니다.
- `.prettierrc`와 `.prettierignore` 파일로 포맷팅 규칙을 관리합니다.

## 라이센스

[MIT License](LICENSE) 