import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { parseBody, parseInline } from "../../utils/sections";
import "./ServiceSections.css";

function Inline({ text }) {
  return parseInline(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>));
}

// 단락 내용: 문단 / 소제목 / 글머리·번호 목록. HTML은 해석하지 않는다.
export function SectionBody({ text }) {
  const blocks = parseBody(text);
  return blocks.map((b, i) => {
    if (b.type === "h") {
      return (
        <h4 key={i} className="svc-h">
          <Inline text={b.text} />
        </h4>
      );
    }
    if (b.type === "ul" || b.type === "ol") {
      const Tag = b.type;
      return (
        <Tag key={i} className="svc-list">
          {b.items.map((it, j) => (
            <li key={j}>
              <Inline text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    return (
      <p key={i} className="svc-p">
        {b.lines.map((ln, j) => (
          <span key={j}>
            {j > 0 && <br />}
            <Inline text={ln} />
          </span>
        ))}
      </p>
    );
  });
}

// 단락 한 개: 왼쪽 제목 / 오른쪽 내용 (제목이 없으면 내용이 전체 폭). 관리자 미리보기에서도 그대로 쓴다.
// 이미지(차트·표·사진). onZoom이 있으면 클릭해서 크게 볼 수 있다.
function Figure({ section, onZoom }) {
  const { imageUrl, image, caption, title } = section;
  if (!imageUrl) {
    // 이미지가 있는 단락인데 아직 읽는 중: 자리를 잡아 둔다
    return image ? <div className="svc-figure svc-figure--loading" aria-hidden="true" /> : null;
  }
  const alt = caption || title || "";
  // 이미지는 Firestore에서 읽은 데이터 주소라 네트워크 지연이 없다. lazy를 쓰면 화면 밖 이미지의 높이가 0이 되어 레이아웃이 흔들린다.
  const img = <img src={imageUrl} alt={alt} />;
  return (
    <figure className="svc-figure">
      {onZoom ? (
        <button type="button" className="svc-figure__btn" onClick={() => onZoom({ src: imageUrl, alt })} title="클릭하면 크게 봅니다">
          {img}
        </button>
      ) : (
        img
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function ServiceSection({ section, innerRef, onZoom }) {
  const { title, body, anim, style, imgPos = "below" } = section;
  const figure = <Figure section={section} onZoom={onZoom} />;
  const hasFigure = Boolean(section.imageUrl || section.image);
  // "이미지만"이면 내용을 숨긴다 (이미지가 없는 단락이면 내용을 그대로 보여준다)
  const text = imgPos === "only" && hasFigure ? null : <SectionBody text={body} />;
  const side = imgPos === "side" && hasFigure;
  return (
    <section
      ref={innerRef}
      className={`svc-section svc-style-${style}${title ? "" : " svc-section--notitle"}`}
      data-anim={anim}
    >
      {title && (
        <div className="svc-section__title">
          <h3>{title}</h3>
        </div>
      )}
      <div className={`svc-section__body${side ? " svc-body--side" : ""}`}>
        {side ? (
          <>
            <div className="svc-body__text">{text}</div>
            {figure}
          </>
        ) : imgPos === "above" ? (
          <>
            {figure}
            {text}
          </>
        ) : (
          <>
            {text}
            {figure}
          </>
        )}
      </div>
    </section>
  );
}

// 클릭하면 이미지를 크게 보여주는 창. ESC 또는 바깥 클릭으로 닫는다.
function Lightbox({ zoom, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="svc-lightbox" role="dialog" aria-modal="true" aria-label="이미지 크게 보기" onClick={onClose}>
      <img src={zoom.src} alt={zoom.alt} />
      <button type="button" className="svc-lightbox__close" aria-label="닫기" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

// 단락 목록. 각 단락은 화면에 들어올 때 한 번만 등장 애니메이션이 재생된다.
export default function ServiceSections({ sections }) {
  const refs = useRef([]);
  const [zoom, setZoom] = useState(null);
  // 부모가 다시 그려져도(배열이 새로 만들어져도) 내용이 같으면 효과를 다시 실행하지 않는다 → 이미 나온 단락이 재생되지 않음
  const key = sections.map((s) => `${s.id}:${s.anim}`).join("|");

  useLayoutEffect(() => {
    // 이미 등장한(is-in) 단락은 건드리지 않는다
    const els = refs.current.filter((el) => el && !el.classList.contains("is-in"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!els.length || reduce || typeof IntersectionObserver === "undefined") return undefined;

    // 첫 화면이 그려지기 전에 숨김 상태로 만들어 깜빡임 없이 등장시킨다
    els.forEach((el) => {
      if (el.dataset.anim !== "none") el.classList.add("is-hidden");
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.remove("is-hidden");
          e.target.classList.add("is-in");
          io.unobserve(e.target); // 한 번만 재생
        });
      },
      // 단락 위쪽이 화면의 아래 35% 지점을 지나면 시작 (원본처럼 화면 중간쯤에서 등장)
      { rootMargin: "0px 0px -35% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key가 sections의 내용을 대표한다
  }, [key]);

  return (
    <div className="svc-sections">
      {sections.map((s, i) => (
        <ServiceSection key={s.id} section={s} innerRef={(el) => (refs.current[i] = el)} onZoom={setZoom} />
      ))}
      {zoom && <Lightbox zoom={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
