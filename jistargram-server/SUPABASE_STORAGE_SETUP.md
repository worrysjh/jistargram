# Supabase Storage 설정 가이드

이 프로젝트는 이미지 저장을 위해 Supabase Storage를 사용합니다.

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택

### 1.2 Storage Bucket 생성
1. Supabase 대시보드에서 **Storage** 메뉴 선택
2. **Create a new bucket** 클릭
3. Bucket 이름: `jistargram-images`
4. **Public bucket** 체크 (이미지를 공개적으로 접근 가능하게 설정)
5. **Create bucket** 클릭

### 1.3 Storage 폴더 구조 생성
Bucket 내에 다음 폴더들을 생성합니다:
- `post_imgs/` - 게시글 이미지 저장
- `profile_imgs/` - 프로필 이미지 저장

## 2. 환경 변수 설정

### 2.1 Supabase 키 확인
1. Supabase 대시보드에서 **Settings** > **API** 메뉴로 이동
2. 다음 정보를 확인:
   - **Project URL**: `SUPABASE_URL`에 사용
   - **service_role key**: `SUPABASE_SERVICE_KEY`에 사용 (⚠️ anon key가 아닌 service_role key 사용)

### 2.2 .env.development 파일 수정
`.env.development` 파일에 다음 환경 변수를 추가:

```env
# Supabase Storage
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

⚠️ **주의**: `service_role` key는 서버 측에서만 사용해야 하며, 절대 클라이언트에 노출되어서는 안 됩니다.

## 3. 변경 사항 요약

### 3.1 수정된 파일들
- ✅ `src/config/supabase.js` - Supabase 클라이언트 설정
- ✅ `src/middlewares/uploadPostImage.js` - 게시글 이미지 업로드 미들웨어
- ✅ `src/middlewares/uploadProfileImage.js` - 프로필 이미지 업로드 미들웨어
- ✅ `src/routes/postRoutes.js` - 게시글 라우트
- ✅ `src/routes/userRoutes.js` - 사용자 라우트
- ✅ `src/controllers/postController.js` - 게시글 컨트롤러
- ✅ `src/controllers/userController.js` - 사용자 컨트롤러
- ✅ `src/services/user.service.js` - 사용자 서비스
- ✅ `app.js` - 정적 파일 제공 제거

### 3.2 주요 변경 내용
1. **로컬 파일 시스템 → Supabase Storage**
   - 이미지가 더 이상 `public/uploads/`에 저장되지 않음
   - Supabase Storage에 업로드되고 공개 URL 반환

2. **Multer 설정 변경**
   - `diskStorage` → `memoryStorage`
   - 파일을 메모리에 임시 저장 후 Supabase에 업로드

3. **URL 형식 변경**
   - 이전: `/uploads/post_imgs/filename.jpg`
   - 이후: `https://your-project-id.supabase.co/storage/v1/object/public/jistargram-images/post_imgs/filename.jpg`
