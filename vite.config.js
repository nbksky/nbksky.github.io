import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 프로젝트 페이지(https://<user>.github.io/<repo>/)로 배포할 경우
// VITE_BASE_PATH=/<repo>/ 를 지정하세요. 커스텀 도메인이나 유저 페이지는 기본값(/) 그대로 사용합니다.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
