# Discord Bot Boilerplate (TypeScript)

TypeScript로 작성된 디스코드 봇을 위한 보일러플레이트 프로젝트입니다.

## 설치 방법

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

4. 봇을 실행합니다:
```bash
pnpm build
pnpm start
```

개발 모드로 실행하려면:
```bash
pnpm dev
```

## 코드 포맷팅

코드 포맷팅을 적용하려면:
```bash
pnpm format
```

코드 포맷팅 검사:
```bash
pnpm format:check
```

## 프로젝트 구조

- `src/commands/`: 봇 명령어가 위치하는 디렉토리
- `src/events/`: 이벤트 핸들러가 위치하는 디렉토리
- `src/types/`: TypeScript 타입 정의가 위치하는 디렉토리
- `src/index.ts`: 봇의 메인 파일
- `dist/`: 컴파일된 JavaScript 파일이 위치하는 디렉토리

## 명령어 추가하기

`src/commands/` 디렉토리에 새로운 명령어 파일을 추가하세요. 예시는 `ping.ts`를 참고하세요.

## 이벤트 핸들러 추가하기

`src/events/` 디렉토리에 새로운 이벤트 핸들러 파일을 추가하세요. 예시는 `ready.ts`를 참고하세요.

## TypeScript 설정

- `tsconfig.json`: TypeScript 컴파일러 설정
- `package.json`: 프로젝트 의존성 및 스크립트 설정

## 코드 스타일

- `.prettierrc`: Prettier 설정
- `.prettierignore`: Prettier가 무시할 파일 목록 