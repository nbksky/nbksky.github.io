# 법률사무소 홈페이지

React(Vite) + Firebase 기반 법률사무소 홈페이지. 공개 사이트와 관리자 사이트가 하나의 앱에 포함되어 있고, 정적 파일만으로 GitHub Pages에 배포할 수 있도록 구성되어 있습니다.

## 구성

- 공개 사이트: `/`, `/about`, `/location`, `/services`, `/services/:id`, `/notices`, `/notices/:id`, `/consultation`
- 관리자 사이트: `/admin/login`, `/admin` (대시보드, 상담신청 접수, 공지사항, 업무분야, 메인페이지 설정)
- 데이터/인증: Firebase Firestore + Firebase Authentication (이메일/비밀번호)

## 1. Firebase 프로젝트 준비

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. **Authentication → Sign-in method**에서 "이메일/비밀번호" 활성화
3. **Authentication → Users**에서 관리자로 사용할 이메일/비밀번호 계정을 직접 추가 (회원가입 화면은 따로 없습니다 — 콘솔에서 계정을 만드세요)
4. **Firestore Database** 생성 (프로덕션 모드)
5. 이 저장소의 [`firestore.rules`](firestore.rules) 내용을 Firestore 규칙에 그대로 붙여넣고 게시
6. **프로젝트 설정 → 일반 → 내 앱**에서 웹 앱을 추가하고 `firebaseConfig` 값을 확인

## 2. 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 Firebase 설정 값을 채워주세요.

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. 로컬 실행

```bash
npm install
npm run dev
```

`.env` 없이 실행하면 Firebase 연동 없이도 화면은 정상적으로 뜨지만(플레이스홀더 데이터), 로그인/상담신청 저장/콘텐츠 관리는 동작하지 않습니다.

## 4. 콘텐츠 채우기

1. `npm run dev`로 실행 후 `/admin/login`에서 Firebase Authentication에 만든 관리자 계정으로 로그인
2. **메인페이지 설정**에서 사무소명·연락처·주소·문구 입력
3. **업무분야 관리**에서 취급 업무(개인회생, 이혼, 형사 등)를 자유롭게 추가/수정/삭제/순서 변경
4. **공지사항 관리**에서 소식 작성
5. 방문자가 `/consultation`에서 상담을 신청하면 **상담신청 접수** 메뉴에 실시간으로 쌓입니다

## 5. GitHub Pages 배포

라우팅은 GitHub Pages(정적 호스팅)에서도 새로고침 시 깨지지 않도록 HashRouter를 사용합니다 (`/#/about` 형태 URL).

프로젝트 페이지(`https://<계정>.github.io/<저장소명>/`)로 배포하는 경우, 빌드 시 base 경로를 지정해야 합니다:

```bash
VITE_BASE_PATH=/저장소명/ npm run deploy
```

커스텀 도메인이나 유저 페이지(`https://<계정>.github.io/`)라면 그냥:

```bash
npm run deploy
```

`deploy` 스크립트는 `vite build` 후 `gh-pages` 브랜치로 `dist` 폴더를 배포합니다. 이후 저장소의 **Settings → Pages**에서 배포 브랜치를 `gh-pages`로 지정하세요.

### 커스텀 도메인 (nalawdo.co.kr)

현재 `public/CNAME`에 `nalawdo.co.kr`이 지정되어 있습니다. 이 파일은 빌드 때 `dist`로 복사되어, 배포할 때마다 GitHub Pages의 도메인 설정이 풀리는 것을 막아 줍니다. 도메인을 바꾸려면 이 파일의 내용을 고치고 다시 배포하세요.

1. DNS (후이즈 등 도메인 업체)
   - 루트 도메인 A 레코드 4개: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` CNAME 레코드: `nbksky.github.io` (저장소명은 붙이지 않음)
   - IP는 GitHub이 바꿀 수 있으니 [공식 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)와 대조하세요.
2. GitHub 저장소 **Settings → Pages → Custom domain**에 도메인을 입력하고 저장, DNS 확인 후 **Enforce HTTPS** 켜기
3. Firebase Console → Authentication → 설정 → **승인된 도메인**에 `nalawdo.co.kr`, `www.nalawdo.co.kr` 추가 (빠뜨리면 관리자 로그인 불가)
4. EmailJS에서 허용 도메인을 제한했다면 새 도메인도 추가

> 빌드에는 `.env`의 Firebase 값이 그대로 번들에 포함됩니다. Firebase 웹 API 키는 공개되어도 되는 값이지만(브라우저에서 항상 노출됨), 반드시 Firestore 보안 규칙(`firestore.rules`)으로 실제 접근 권한을 통제해야 합니다.

## 디자인 톤

브라운(`#2a2320`) · 오렌지(`#e2892f`) 포인트 컬러, Noto Sans KR 폰트를 사용합니다. 색상/폰트는 `src/index.css`의 CSS 변수에서 한 번에 바꿀 수 있습니다.
