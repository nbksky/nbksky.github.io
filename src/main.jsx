import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DEFAULT_APPEARANCE, applyToRoot } from './theme'

// 관리자 화면 등 테마 영역 밖에서 쓰는 기본 색상/글꼴 변수
applyToRoot(DEFAULT_APPEARANCE)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
