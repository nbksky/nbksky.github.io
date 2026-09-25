import { useRef, useState } from "react";
import { DEFAULT_IMAGE_ADJUST } from "../../api/content";
import { resizeImage } from "../../utils/image";
import HeroBg from "../public/HeroBg";
import "./HeroImageEditor.css";

// 실제 화면(히어로/배너)의 대략적인 가로:세로 비율
const ASPECTS = {
  hero: { desktop: 3.4, mobile: 0.93 },
  banner: { desktop: 5, mobile: 1.3 },
};

export default function HeroImageEditor({
  label,
  hint,
  kind = "hero",
  value,
  onChange,
  maxWidth = 1600,
  maxBytes = 300 * 1024,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [device, setDevice] = useState("desktop");
  const [showText, setShowText] = useState(true);

  const adjust = { ...DEFAULT_IMAGE_ADJUST, ...value };
  const aspect = ASPECTS[kind][device];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file, { maxWidth, maxBytes });
      onChange({ ...DEFAULT_IMAGE_ADJUST, dataUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setAdjust = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="form-field">
      <label>{label}</label>
      {hint && <p className="hero-editor__hint">{hint}</p>}

      <div className="hero-editor">
        <div className="hero-editor__toolbar">
          <div className="hero-editor__devices" role="group" aria-label="미리보기 화면 크기">
            {[
              ["desktop", "데스크톱"],
              ["mobile", "모바일"],
            ].map(([id, text]) => (
              <button
                key={id}
                type="button"
                className={device === id ? "is-active" : ""}
                onClick={() => setDevice(id)}
              >
                {text}
              </button>
            ))}
          </div>
          <label className="hero-editor__check">
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            글자 영역 표시
          </label>
        </div>

        <div className="hero-editor__stage">
          <div
            className={`hero-preview hero-preview--${kind} hero-preview--${device}`}
            style={{ aspectRatio: aspect }}
          >
            {value?.dataUrl && <HeroBg image={adjust} />}
            {!value?.dataUrl && <span className="hero-preview__empty">등록된 사진 없음</span>}
            {showText && (
              <div className={`hero-preview__text hero-preview__text--${kind}`}>
                {kind === "hero" ? "제목 · 버튼" : "제목"}
              </div>
            )}
          </div>
        </div>

        <div className="hero-editor__actions">
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "처리 중..." : value?.dataUrl ? "사진 변경" : "사진 선택"}
          </button>
          {value?.dataUrl && (
            <button type="button" className="hero-editor__remove" onClick={() => onChange(null)}>
              삭제
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />

        {value?.dataUrl && (
          <div className="hero-editor__sliders">
            <label>
              <span>가로 위치 {Math.round(adjust.x)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={adjust.x}
                onChange={(e) => setAdjust({ x: Number(e.target.value) })}
              />
            </label>
            <label>
              <span>세로 위치 {Math.round(adjust.y)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={adjust.y}
                onChange={(e) => setAdjust({ y: Number(e.target.value) })}
              />
            </label>
            <label>
              <span>확대 {adjust.zoom.toFixed(2)}배</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={adjust.zoom}
                onChange={(e) => setAdjust({ zoom: Number(e.target.value) })}
              />
            </label>
            <button
              type="button"
              className="hero-editor__reset"
              onClick={() => setAdjust({ ...DEFAULT_IMAGE_ADJUST })}
            >
              위치/확대 초기화
            </button>
            <p className="hero-editor__note">
              사진이 영역보다 클 때만 그 방향으로 움직입니다. 더 움직이려면 확대를 키워보세요.
            </p>
          </div>
        )}
      </div>
      {error && <p className="hero-editor__error">{error}</p>}
    </div>
  );
}
