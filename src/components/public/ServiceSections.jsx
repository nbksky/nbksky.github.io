import { useLayoutEffect, useRef } from "react";
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
export function ServiceSection({ section, innerRef }) {
  const { title, body, anim, style } = section;
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
      <div className="svc-section__body">
        <SectionBody text={body} />
      </div>
    </section>
  );
}

// 단락 목록. 각 단락은 화면에 들어올 때 한 번만 등장 애니메이션이 재생된다.
export default function ServiceSections({ sections }) {
  const refs = useRef([]);
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
        <ServiceSection key={s.id} section={s} innerRef={(el) => (refs.current[i] = el)} />
      ))}
    </div>
  );
}
