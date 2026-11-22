// 업무분야 상세 페이지의 "단락" 데이터와 내용 서식 해석.
// 단락: { id, title, body, anim, style }

export const ANIMATIONS = [
  ["slide", "좌우 슬라이드 (제목은 왼쪽, 내용은 오른쪽에서)"],
  ["up", "아래에서 위로 올라오며 나타남"],
  ["fade", "페이드(서서히 나타남)"],
  ["none", "애니메이션 없음"],
];

export const STYLES = [
  ["plain", "일반"],
  ["box", "회색 박스 목록 (문단·항목마다 박스)"],
  ["numbered", "번호 강조 (번호 목록을 원형 번호로)"],
];

// 단락 이미지(차트·표·사진) 배치
export const IMG_POSITIONS = [
  ["below", "내용 아래"],
  ["above", "내용 위"],
  ["side", "내용 오른쪽에 나란히 (넓은 화면)"],
  ["only", "이미지만 (내용 숨김)"],
];

const ANIM_KEYS = ANIMATIONS.map(([k]) => k);
const STYLE_KEYS = STYLES.map(([k]) => k);
const IMG_KEYS = IMG_POSITIONS.map(([k]) => k);

let seq = 0;
const makeId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function newSection(partial = {}) {
  return { id: makeId(), title: "", body: "", anim: "slide", style: "plain", ...partial };
}

// 저장된 값을 안전한 형태로 맞춘다 (알 수 없는 값은 기본값).
// 이미지 본문(imageUrl)은 Firestore 문서 크기 제한 때문에 단락 문서에 넣지 않고 별도 문서에 저장한다.
// 단락에는 "이미지가 있다"는 표시(image)만 남기고, 관리자 폼과 공개 페이지는 따로 읽어서 imageUrl로 붙인다.
function normalize(s) {
  const imageUrl = typeof s.imageUrl === "string" ? s.imageUrl : "";
  return {
    id: typeof s.id === "string" && s.id ? s.id : makeId(),
    title: typeof s.title === "string" ? s.title : "",
    body: typeof s.body === "string" ? s.body : "",
    anim: ANIM_KEYS.includes(s.anim) ? s.anim : "slide",
    style: STYLE_KEYS.includes(s.style) ? s.style : "plain",
    image: Boolean(imageUrl) || s.image === true,
    caption: typeof s.caption === "string" ? s.caption : "",
    imgPos: IMG_KEYS.includes(s.imgPos) ? s.imgPos : "below",
    imageUrl,
  };
}

// 단락 이미지가 저장되는 문서 키 (settings/img_<키>)
export const sectionImageKey = (serviceId, sectionId) => `svc_${serviceId}_${sectionId}`;

// Firestore 단락 문서에 저장할 모양 (이미지 본문은 제외)
export function toStoredSection(s) {
  const has = Boolean(s.imageUrl);
  return {
    id: s.id,
    title: s.title,
    body: s.body,
    anim: s.anim,
    style: s.style,
    image: has,
    caption: has ? s.caption : "",
    imgPos: s.imgPos,
  };
}

// 업무분야 문서 → 단락 목록.
// sections 배열이 있으면 그것을 쓰고, 없으면(예전 데이터) "상세 설명" 한 칸을 제목 없는 단락 하나로 본다.
export function getSections(service) {
  if (!service) return [];
  if (Array.isArray(service.sections)) return service.sections.map(normalize);
  if (typeof service.detail === "string" && service.detail.trim()) {
    return [normalize({ title: "", body: service.detail, anim: "none", style: "plain" })];
  }
  return [];
}

// 저장 전: 제목·내용·이미지가 모두 없는 단락은 버린다 (이미지만 있는 단락은 남긴다)
export function cleanSections(list) {
  return list
    .map((s) => normalize({ ...s, title: s.title.trim(), body: s.body.replace(/\s+$/g, "") }))
    .filter((s) => s.title || s.body.trim() || s.imageUrl);
}

// ---------- 내용 서식 ----------
// 빈 줄 = 문단 구분 / "- " = 글머리 목록 / "1. " = 번호 목록 / "## " = 소제목 / **굵게**
// HTML은 해석하지 않고 React 요소로만 그리므로 임의 HTML이 들어갈 수 없다.
export function parseBody(text) {
  const blocks = [];
  let cur = null;
  const flush = () => {
    if (cur) blocks.push(cur);
    cur = null;
  };
  for (const raw of String(text || "").replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    let m;
    if ((m = line.match(/^##\s+(.*)$/))) {
      flush();
      blocks.push({ type: "h", text: m[1] });
    } else if ((m = line.match(/^\s*[-•]\s+(.*)$/))) {
      if (!cur || cur.type !== "ul") {
        flush();
        cur = { type: "ul", items: [] };
      }
      cur.items.push(m[1]);
    } else if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      // 입력한 번호를 버리지 않는다: 목록의 시작 번호(start)로 보존한다.
      // 항목 사이에 빈 줄이나 설명 문단이 끼어 목록이 여러 개로 나뉘어도 각자 입력한 번호로 시작하고,
      // 붙어 있는 줄은 첫 번호부터 순서대로 올라간다.
      if (!cur || cur.type !== "ol") {
        flush();
        cur = { type: "ol", start: Number(m[1]), items: [] };
      }
      cur.items.push(m[2]);
    } else {
      if (!cur || cur.type !== "p") {
        flush();
        cur = { type: "p", lines: [] };
      }
      cur.lines.push(line);
    }
  }
  flush();
  return blocks;
}

// "**굵게**"를 조각으로 나눈다: [{ text, bold }]
export function parseInline(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((t) => t !== "")
    .map((t) => (t.startsWith("**") && t.endsWith("**") && t.length > 4 ? { text: t.slice(2, -2), bold: true } : { text: t, bold: false }));
}
