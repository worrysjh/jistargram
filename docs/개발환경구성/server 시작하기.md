# 📡 Jistargram Server

Jistargram 프로젝트의 백엔드 서버입니다.  
Express.js + PostgreSQL 기반의 RESTful API 서버로, 회원가입 기능을 포함하고 있습니다.


## 🛠 기술 스택

- **Node.js / Express.js** – 서버 프레임워크
- **PostgreSQL** – 관계형 데이터베이스
- **bcrypt** – 비밀번호 해싱
- **jsonwebtoken (JWT)** – 인증 처리
- **dotenv** – 환경 변수 관리

---

## ⚙️ 프로젝트 실행 방법

### 1. 레포지토리 클론

```bash
git clone https://github.com/yourname/jistargram.git
cd jistargram/jistargram-server
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`파일을 참고해 `.env`파일을 생성합니다.

```bash
cp .env.example .env
```

`.env` 파일은 Git에 포함되지 않으며, 개인 설정 값을 직접 입력해야 합니다.

### 4. 서버 실행

```bash
npm run dev
```

서버가 정상적으로 실행되면 다음과 같은 메시지를 출력합니다.

```arduino
✅ Server running on port 4000
```