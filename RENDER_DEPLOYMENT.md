# Render.com 배포 가이드

## 🚀 Render.com 무료 배포 방법

### 1. Render.com 가입
1. [Render.com](https://render.com) 접속
2. GitHub 계정으로 로그인 또는 회원가입

### 2. 새 Web Service 생성
1. Dashboard에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결 (Connect a repository)

### 3. 서비스 설정
- **Name**: `financial-statement-visualizer`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (가장 빠름)
- **Branch**: `main` 또는 `master`
- **Build Command**: `npm install`
- **Start Command**: `node backend/server.js`

### 4. 환경변수 설정
**Environment Variables** 섹션에서 다음 변수들을 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `NODE_ENV` | `production` | 프로덕션 환경 설정 |
| `OPENDART_API_KEY` | `your_opendart_api_key` | OpenDART API 키 |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Gemini API 키 |
| `PORT` | `10000` | Render.com 기본 포트 |

### 5. 배포 실행
1. **"Create Web Service"** 버튼 클릭
2. 자동으로 빌드 및 배포 시작
3. 배포 완료까지 2-3분 소요

### 6. 배포 확인
- 배포가 완료되면 `https://your-app-name.onrender.com` URL 제공
- 브라우저에서 접속하여 테스트

## ⚠️ 주의사항

### 무료 티어 제한
- **월 750시간** 무료 (약 31일)
- **15분 비활성 후 슬립 모드** (첫 요청 시 깨어남)
- **512MB RAM** 제한
- **CPU 제한** 있음

### 데이터베이스 파일
- SQLite 파일(`corpCode/corpcode.db`)이 저장소에 포함되어야 함
- 파일 크기가 100MB 이하여야 함

## 🔧 문제 해결

### 배포 실패 시
1. **Build Logs** 확인
2. **Runtime Logs** 확인
3. 환경변수 설정 확인
4. 데이터베이스 파일 경로 확인

### 서비스가 응답하지 않을 때
1. **Manual Deploy** 실행
2. **Restart** 서비스
3. 로그에서 오류 메시지 확인

## 📝 추가 팁

### 커스텀 도메인
- 무료 티어에서도 커스텀 도메인 사용 가능
- DNS 설정 필요

### 자동 배포
- GitHub에 push하면 자동으로 재배포
- 특정 브랜치만 배포하도록 설정 가능

### 모니터링
- 무료 티어에서도 기본 모니터링 제공
- 응답 시간, 오류율 등 확인 가능 