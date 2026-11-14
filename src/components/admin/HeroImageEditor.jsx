import { useRef, useState } from "react";
import { DEFAULT_HERO_LAYOUT, DEFAULT_HERO_SAFE, DEFAULT_IMAGE_ADJUST } from "../../api/content";
import { resizeImage } from "../../utils/image";
import HeroBg from "../public/HeroBg";
import "./HeroImageEditor.css";

// 실제 화면(히어로/배너)의 가로:세로 비율. 메인 데스크톱은 공개 페이지의 16:9 무대와 같다.
const ASPECTS = {
  hero: { desktop: 16 / 9, mobile: 0.93 },
  banner: { desktop: 5, mobile: 1.3 },
};

const RECOMMEND = {
  hero: "권장 사이즈: 가로 1920px × 세로 1080px (16:9). 메인 화면은 16:9 틀 안에 사진·제목·버튼이 함께 배치되고, 16:9가 아닌 화면에서는 가장자리가 조금 잘립니다. 가로 1600px보다 큰 사진은 자동으로 줄여서 저장됩니다.",
  banner:
    "권장 사이즈: 가로 1600px × 세로 320px (5:1). 중요한 내용은 사진 가운데 가로 띠 안에 두세요. 화면 크기에 따라 위아래가 잘릴 수 있으며, 가로 1600px보다 큰 사진은 자동으로 줄여서 저장됩니다.",
};

// 미리보기 안 제목/버튼 상자의 대략적인 크기(틀 대비 %)
const BOX_SIZE = {
  title: { w: 34, h: 30 },
  btn: { w: 24, h: 9 },
};

const SAFE_MIN = 8; // 꼭 보일 영역의 최소 크기(%)
const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const round1 = (v) => Math.round(v * 10) / 10;
// 가운데(50%)에 가까우면 자석처럼 붙인다
const snapCenter = (v) => (Math.abs(v - 50) < 1.5 ? 50 : v);

// 안전 영역 모서리 핸들: 어느 변이 움직이는지
const SAFE_CORNERS = {
  "safe-nw": { l: true, t: true },
  "safe-ne": { r: true, t: true },
  "safe-sw": { l: true, b: true },
  "safe-se": { r: true, b: true },
};

export default function HeroImageEditor({
  label,
  hint,
  kind = "hero",
  value,
  onChange,
  maxWidth = 1600,
  maxBytes = 300 * 1024,
  layout,
  onLayoutChange,
}) {
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [device, setDevice] = useState("desktop");
  const [showText, setShowText] = useState(true);
  const [dragging, setDragging] = useState(null);

  const adjust = { ...DEFAULT_IMAGE_ADJUST, ...value };
  const aspect = ASPECTS[kind][device];
  const hasLayout = kind === "hero" && layout && onLayoutChange;
  const boxesDraggable = hasLayout && device === "desktop";
  const safe = hasLayout ? layout.safe : null;

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

  // mode: "photo" | "title" | "btn" | "safe-move" | "safe-nw|ne|sw|se"
  const beginDrag = (e, mode) => {
    if (e.button !== undefined && e.button !== 0) return;
    const stage = previewRef.current;
    if (!stage) return;
    e.preventDefault();
    e.stopPropagation();
    stage.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode,
      sx: e.clientX,
      sy: e.clientY,
      rect: stage.getBoundingClientRect(),
      itemRect: mode === "title" || mode === "btn" ? e.currentTarget.getBoundingClientRect() : null,
      adjust: { ...adjust },
      layout: layout ? { ...layout } : null,
    };
    setDragging(mode);
  };

  const handleMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;

    // 사진: 크기와 상관없이 네 방향으로 자유롭게 이동 (틀 대비 %). 빈 곳은 테마 색이 보인다.
    if (d.mode === "photo") {
      onChange({
        ...value,
        offX: round1(clamp(d.adjust.offX + (dx / d.rect.width) * 100, -150, 150)),
        offY: round1(clamp(d.adjust.offY + (dy / d.rect.height) * 100, -150, 150)),
      });
      return;
    }

    // 꼭 보일 영역: 이동 또는 모서리 크기 조절 (틀 대비 %)
    if (d.mode.startsWith("safe")) {
      const dxp = (dx / d.rect.width) * 100;
      const dyp = (dy / d.rect.height) * 100;
      const s = d.layout.safe;
      let { x, y, w, h } = s;
      if (d.mode === "safe-move") {
        x = clamp(s.x + dxp, 0, 100 - s.w);
        y = clamp(s.y + dyp, 0, 100 - s.h);
      } else {
        const c = SAFE_CORNERS[d.mode];
        const right = s.x + s.w;
        const bottom = s.y + s.h;
        if (c.l) {
          x = clamp(s.x + dxp, 0, right - SAFE_MIN);
          w = right - x;
        }
        if (c.r) w = clamp(s.x + s.w + dxp, s.x + SAFE_MIN, 100) - s.x;
        if (c.t) {
          y = clamp(s.y + dyp, 0, bottom - SAFE_MIN);
          h = bottom - y;
        }
        if (c.b) h = clamp(s.y + s.h + dyp, s.y + SAFE_MIN, 100) - s.y;
      }
      onLayoutChange({ ...d.layout, safe: { x: round1(x), y: round1(y), w: round1(w), h: round1(h) } });
      return;
    }

    // 제목/버튼 상자: 위치 %는 "틀 - 상자" 여백 기준이라, 마우스가 움직인 만큼 상자가 정확히 따라온다
    const slackX = d.rect.width - d.itemRect.width;
    const slackY = d.rect.height - d.itemRect.height;
    const [kx, ky] = d.mode === "title" ? ["titleX", "titleY"] : ["btnX", "btnY"];
    const next = { ...d.layout };
    if (slackX > 1) next[kx] = round1(snapCenter(clamp(d.layout[kx] + (dx / slackX) * 100)));
    if (slackY > 1) next[ky] = round1(snapCenter(clamp(d.layout[ky] + (dy / slackY) * 100)));
    onLayoutChange(next);
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(null);
  };

  const boxStyle = (type, x, y) => ({
    left: `${x}%`,
    top: `${y}%`,
    width: `${BOX_SIZE[type].w}%`,
    height: `${BOX_SIZE[type].h}%`,
    transform: `translate(${-x}%, ${-y}%)`,
  });

  const toggleSafe = (on) => onLayoutChange({ ...layout, safe: on ? { ...DEFAULT_HERO_SAFE } : null });

  return (
    <div className="form-field">
      <label>{label}</label>
      {hint && <p className="hero-editor__hint">{hint}</p>}
      <p className="hero-editor__recommend">{RECOMMEND[kind]}</p>

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
            {kind === "hero" ? "제목·버튼 상자 표시" : "글자 영역 표시"}
          </label>
          {hasLayout && device === "desktop" && (
            <label className="hero-editor__check">
              <input type="checkbox" checked={!!safe} onChange={(e) => toggleSafe(e.target.checked)} />
              꼭 보일 영역 사용
            </label>
          )}
        </div>

        <p className="hero-editor__note">
          {value?.dataUrl ? "빈 곳을 드래그하면 사진이 위·아래·왼쪽·오른쪽으로 움직입니다. " : ""}
          {boxesDraggable
            ? "제목·버튼 상자도 각각 드래그하세요. 가운데 근처에서는 가운데에 붙습니다. "
            : hasLayout
              ? "모바일에서는 제목과 버튼이 가운데에 위에서 아래로 자동 배치됩니다. 위치는 데스크톱에서 정하세요. "
              : ""}
          {boxesDraggable && safe
            ? "'꼭 보일 영역'은 인물 등 잘리면 안 되는 부분에 맞추세요. 어떤 화면 비율에서도 이 영역이 잘리지 않게 사이트가 사진 틀을 맞춰 줍니다."
            : boxesDraggable
              ? "인물이 잘리면 안 된다면 '꼭 보일 영역 사용'을 켜세요."
              : ""}
        </p>

        <div className="hero-editor__stage">
          <div
            ref={previewRef}
            className={`hero-preview hero-preview--${kind} hero-preview--${device}${
              value?.dataUrl ? " is-draggable" : ""
            }${dragging ? " is-dragging" : ""}`}
            style={{ aspectRatio: aspect }}
            onPointerDown={(e) => value?.dataUrl && beginDrag(e, "photo")}
            onPointerMove={handleMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {value?.dataUrl && <HeroBg image={adjust} />}
            {!value?.dataUrl && <span className="hero-preview__empty">등록된 사진 없음</span>}

            {safe && device === "desktop" && (
              <div
                className="hero-preview__safe"
                style={{ left: `${safe.x}%`, top: `${safe.y}%`, width: `${safe.w}%`, height: `${safe.h}%` }}
              >
                <span
                  className="hero-preview__safe-chip"
                  onPointerDown={(e) => beginDrag(e, "safe-move")}
                  title="끌어서 이동"
                >
                  꼭 보일 영역 · 끌어서 이동
                </span>
                {Object.keys(SAFE_CORNERS).map((mode) => (
                  <span
                    key={mode}
                    className={`hero-preview__safe-handle hero-preview__safe-handle--${mode.slice(5)}`}
                    onPointerDown={(e) => beginDrag(e, mode)}
                    title="끌어서 크기 조절"
                  />
                ))}
              </div>
            )}

            {dragging && (dragging === "title" || dragging === "btn") && (
              <>
                <span className="hero-preview__guide hero-preview__guide--v" />
                <span className="hero-preview__guide hero-preview__guide--h" />
              </>
            )}

            {showText && hasLayout && device === "desktop" && (
              <>
                <div
                  className={`hero-preview__item hero-preview__item--title${
                    dragging === "title" ? " is-active" : ""
                  }`}
                  style={boxStyle("title", layout.titleX, layout.titleY)}
                  onPointerDown={(e) => beginDrag(e, "title")}
                >
                  제목
                </div>
                <div
                  className={`hero-preview__item hero-preview__item--btn${
                    dragging === "btn" ? " is-active" : ""
                  }`}
                  style={boxStyle("btn", layout.btnX, layout.btnY)}
                  onPointerDown={(e) => beginDrag(e, "btn")}
                >
                  버튼
                </div>
              </>
            )}

            {showText && hasLayout && device === "mobile" && (
              <div className="hero-preview__text hero-preview__text--hero hero-preview__text--static">
                제목 · 버튼
              </div>
            )}

            {showText && !hasLayout && (
              <div className={`hero-preview__text hero-preview__text--${kind} hero-preview__text--static`}>
                제목
              </div>
            )}
          </div>
        </div>

        {hasLayout && (
          <div className="hero-editor__pos">
            <span className="hero-editor__pos-label">
              제목 {Math.round(layout.titleX)}%, {Math.round(layout.titleY)}% · 버튼 {Math.round(layout.btnX)}%,{" "}
              {Math.round(layout.btnY)}%
              {safe
                ? ` · 꼭 보일 영역 ${Math.round(safe.x)}%, ${Math.round(safe.y)}% (${Math.round(safe.w)}×${Math.round(safe.h)}%)`
                : ""}
            </span>
            <button
              type="button"
              className="hero-editor__reset"
              onClick={() => onLayoutChange({ ...DEFAULT_HERO_LAYOUT, safe: layout.safe })}
            >
              제목·버튼 위치 초기화
            </button>
          </div>
        )}

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
              <span>
                크기 {adjust.zoom.toFixed(2)}배 (1배보다 작으면 사진이 줄어들고 남는 곳은 테마 색이 보입니다)
              </span>
              <input
                type="range"
                min="0.3"
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
              사진 위치/크기 초기화
            </button>
          </div>
        )}
      </div>
      {error && <p className="hero-editor__error">{error}</p>}
    </div>
  );
}
