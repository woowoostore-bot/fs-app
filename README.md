# 재무제표 시각화 애플리케이션

이 프로젝트는 OpenDART API를 사용하여 기업의 재무제표를 조회하고 시각화하는 웹 애플리케이션입니다.

## 설치 및 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# OpenDART API 키 (https://opendart.fss.or.kr/ 에서 발급)
OPENDART_API_KEY=your_opendart_api_key_here

# Gemini API 키 (https://makersuite.google.com/app/apikey 에서 발급)
GEMINI_API_KEY=your_gemini_api_key_here

# 서버 포트 (기본값: 3000)
PORT=3000
```

### 3. 서버 실행
```bash
npm start
```

또는

```bash
node backend/server.js
```

### 4. 브라우저에서 접속
서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하세요.

## 사용 방법

1. 회사명을 입력하세요 (예: 삼성전자, 현대자동차)
2. 사업연도를 선택하세요 (기본값: 2023)
3. 보고서 종류를 선택하세요 (사업보고서, 반기보고서 등)
4. "조회" 버튼을 클릭하세요
5. 재무제표 데이터가 표와 차트로 표시됩니다
6. "쉽게 설명" 버튼을 클릭하면 AI가 재무제표를 쉽게 설명해줍니다

## API 키 발급 방법

### OpenDART API 키
1. https://opendart.fss.or.kr/ 접속
2. 회원가입 후 로그인
3. "오픈API 신청" 메뉴에서 API 키 발급

### Gemini API 키
1. https://makersuite.google.com/app/apikey 접속
2. Google 계정으로 로그인
3. "Create API Key" 버튼을 클릭하여 API 키 발급

## 배포 방법

### Vercel 배포 (추천)
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경변수 설정:
   - `OPENDART_API_KEY`: OpenDART API 키
   - `GEMINI_API_KEY`: Gemini API 키
4. 자동 배포 완료

### Railway 배포
1. [Railway](https://railway.app)에 가입
2. GitHub 저장소 연결
3. 환경변수 설정
4. 자동 배포 완료

### Render.com 배포 (무료)
1. [Render](https://render.com)에 가입
2. "New Web Service" 클릭
3. GitHub 저장소 연결
4. 다음 설정:
   - **Name**: financial-statement-visualizer
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
5. 환경변수 설정:
   - `OPENDART_API_KEY`: OpenDART API 키
   - `GEMINI_API_KEY`: Gemini API 키
   - `NODE_ENV`: production
6. "Create Web Service" 클릭하여 배포

### Heroku 배포
1. [Heroku](https://heroku.com)에 가입
2. Heroku CLI 설치
3. 다음 명령어 실행:
```bash
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
heroku config:set OPENDART_API_KEY=your_key
heroku config:set GEMINI_API_KEY=your_key
```

## 기술 스택

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript, Bootstrap, Chart.js
- **Database**: SQLite (better-sqlite3)
- **APIs**: OpenDART API, Google Gemini API 