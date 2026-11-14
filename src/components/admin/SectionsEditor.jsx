import { useRef, useState } from "react";
import { ANIMATIONS, IMG_POSITIONS, STYLES, newSection } from "../../utils/sections";
import { ServiceSection } from "../public/ServiceSections";
import ImageUpload from "./ImageUpload";
import "./SectionsEditor.css";

// 업무분야 상세 페이지의 단락 목록 편집기. 카드를 드래그(또는 ↑↓)로 순서 변경한다.
export default function SectionsEditor({ sections, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [preview, setPreview] = useState({});
  const cardRefs = useRef({});

  const update = (id, patch) => onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id) => {
    const s = sections.find((x) => x.id === id);
    if ((s.title || s.body) && !window.confirm("이 단락을 삭제할까요?")) return;
    onChange(sections.filter((x) => x.id !== id));
  };
  const reorder = (from, to) => {
    if (from === null || to === null || from === to || to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  const add = () => onChange([...sections, newSection()]);

  const endDrag = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="form-field">
      <label>상세 단락 (상세 페이지에 위에서 아래로 표시)</label>
      <p className="sections-editor__hint">
        단락마다 <b>제목</b>(왼쪽)과 <b>내용</b>(오른쪽)을 입력합니다. 내용에는 빈 줄로 문단을 나누고, <code>- </code>로 글머리 목록,{" "}
        <code>1. </code>로 번호 목록, <code>## </code>로 소제목, <code>**굵게**</code>를 쓸 수 있습니다. 왼쪽 ⠿ 손잡이를 끌어 순서를 바꾸세요.
      </p>

      {sections.length === 0 && <p className="sections-editor__empty">아직 단락이 없습니다. 아래 버튼으로 추가하세요.</p>}

      <ol className="sections-editor">
        {sections.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => (cardRefs.current[s.id] = el)}
            className={`sections-editor__card${dragIdx === i ? " is-dragging" : ""}${
              overIdx === i && dragIdx !== null && dragIdx !== i ? " is-over" : ""
            }`}
            onDragOver={(e) => {
              if (dragIdx === null) return;
              e.preventDefault();
              setOverIdx(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              reorder(dragIdx, i);
              endDrag();
            }}
          >
            <div className="sections-editor__bar">
              <span
                className="sections-editor__handle"
                draggable
                title="끌어서 순서 변경"
                onDragStart={(e) => {
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", s.id);
                  const card = cardRefs.current[s.id];
                  if (card) e.dataTransfer.setDragImage(card, 24, 24);
                }}
                onDragEnd={endDrag}
              >
                ⠿
              </span>
              <strong>단락 {i + 1}</strong>
              <span className="sections-editor__spacer" />
              <button type="button" onClick={() => reorder(i, i - 1)} disabled={i === 0} aria-label="위로">
                ↑
              </button>
              <button
                type="button"
                onClick={() => reorder(i, i + 1)}
                disabled={i === sections.length - 1}
                aria-label="아래로"
              >
                ↓
              </button>
              <button type="button" className="sections-editor__del" onClick={() => remove(s.id)}>
                삭제
              </button>
            </div>

            <input
              className="sections-editor__title"
              placeholder="제목 (비우면 제목 없이 내용만 표시)"
              value={s.title}
              onChange={(e) => update(s.id, { title: e.target.value })}
            />
            <textarea
              rows={6}
              placeholder={"내용을 입력하세요.\n\n- 목록 항목\n1. 번호 항목\n**굵게**"}
              value={s.body}
              onChange={(e) => update(s.id, { body: e.target.value })}
            />

            <ImageUpload
              label="이미지 (차트·표·사진, 선택)"
              recommend="차트나 표는 글자가 읽히도록 가로 1200px 이상으로 올리세요 (가로 1600px보다 크면 자동으로 줄입니다). 비율은 그대로 표시되고, 방문자가 클릭하면 크게 볼 수 있습니다."
              value={s.imageUrl || ""}
              maxWidth={1600}
              maxBytes={650 * 1024}
              onChange={(url) => update(s.id, { imageUrl: url, image: Boolean(url) })}
            />
            {s.imageUrl && (
              <div className="sections-editor__opts">
                <label className="sections-editor__caption">
                  <span>이미지 설명 (캡션·대체 텍스트, 선택)</span>
                  <input
                    placeholder="예: 개인회생 절차 흐름도"
                    value={s.caption || ""}
                    onChange={(e) => update(s.id, { caption: e.target.value })}
                  />
                </label>
                <label>
                  <span>이미지 배치</span>
                  <select value={s.imgPos} onChange={(e) => update(s.id, { imgPos: e.target.value })}>
                    {IMG_POSITIONS.map(([k, text]) => (
                      <option key={k} value={k}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="sections-editor__opts">
              <label>
                <span>애니메이션</span>
                <select value={s.anim} onChange={(e) => update(s.id, { anim: e.target.value })}>
                  {ANIMATIONS.map(([k, text]) => (
                    <option key={k} value={k}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>스타일</span>
                <select value={s.style} onChange={(e) => update(s.id, { style: e.target.value })}>
                  {STYLES.map(([k, text]) => (
                    <option key={k} value={k}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="sections-editor__preview-btn"
                onClick={() => setPreview((p) => ({ ...p, [s.id]: !p[s.id] }))}
              >
                {preview[s.id] ? "미리보기 닫기" : "미리보기"}
              </button>
            </div>

            {preview[s.id] && (
              <div className="sections-editor__preview">
                {/* 공개 페이지와 같은 컴포넌트로 그린다 (미리보기는 애니메이션 없이 최종 모양) */}
                <ServiceSection section={s} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn-dark sections-editor__add" onClick={add}>
        + 단락 추가
      </button>
    </div>
  );
}
