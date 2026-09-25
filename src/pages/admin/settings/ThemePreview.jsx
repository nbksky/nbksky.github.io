import { useEffect } from "react";
import { buildStyleVars, ensureFonts } from "../../../theme";
import "./ThemePreview.css";

export default function ThemePreview({ appearance }) {
  useEffect(() => {
    ensureFonts(appearance);
  }, [appearance]);

  return (
    <div className="theme-scope theme-preview" style={buildStyleVars(appearance)}>
      <section className="page-hero theme-preview__hero">
        <h1>서브 비주얼 제목</h1>
        <p>보조 설명 글자가 이렇게 보입니다.</p>
      </section>
      <div className="theme-preview__body">
        <div className="theme-preview__menu">
          <span>사무소 소개</span>
          <span className="is-active">업무 분야</span>
          <span>공지사항</span>
        </div>
        <h2 className="section-heading">섹션 제목</h2>
        <h3 className="theme-preview__card-title">소제목 / 카드 제목</h3>
        <p>
          본문 글자입니다. 관리자에서 설정한 색상과 글꼴이 실제 사이트에 이렇게 적용됩니다.
        </p>
        <p className="theme-preview__caption">보조 설명 · 2025.01.01</p>
        <div className="theme-preview__buttons">
          <span className="btn btn-primary">강조 버튼</span>
          <span className="btn btn-dark">어두운 버튼</span>
        </div>
      </div>
    </div>
  );
}
