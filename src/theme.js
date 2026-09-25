export const COLOR_FIELDS = [
  { key: "primary", label: "주색 (다크)", hint: "히어로·푸터·어두운 버튼·제목·배너 오버레이" },
  { key: "accent", label: "강조색", hint: "버튼·활성 메뉴·배지·링크" },
  { key: "surface", label: "배경 보조색", hint: "섹션 배경" },
  { key: "text", label: "본문 글자색", hint: "본문 텍스트" },
  { key: "textSoft", label: "보조 글자색", hint: "설명글·날짜" },
  { key: "line", label: "선/테두리색", hint: "구분선·입력창 테두리" },
];

export const DEFAULT_COLORS = {
  primary: "#2a2320",
  accent: "#e2892f",
  surface: "#f7f3ee",
  text: "#2a2320",
  textSoft: "#6b6058",
  line: "#e7ded4",
};

export const FONT_OPTIONS = [
  { id: "noto-sans", label: "Noto Sans KR (고딕)", css: "'Noto Sans KR'", query: "Noto+Sans+KR:wght@400;500;700;900", weights: [400, 500, 700, 900] },
  { id: "noto-serif", label: "Noto Serif KR (명조)", css: "'Noto Serif KR'", query: "Noto+Serif+KR:wght@400;500;700;900", weights: [400, 500, 700, 900] },
  { id: "nanum-gothic", label: "나눔고딕", css: "'Nanum Gothic'", query: "Nanum+Gothic:wght@400;700;800", weights: [400, 700, 800] },
  { id: "nanum-myeongjo", label: "나눔명조", css: "'Nanum Myeongjo'", query: "Nanum+Myeongjo:wght@400;700;800", weights: [400, 700, 800] },
  { id: "gowun-dodum", label: "고운돋움", css: "'Gowun Dodum'", query: "Gowun+Dodum", weights: [400] },
  { id: "gowun-batang", label: "고운바탕", css: "'Gowun Batang'", query: "Gowun+Batang:wght@400;700", weights: [400, 700] },
  { id: "plex-sans", label: "IBM Plex Sans KR", css: "'IBM Plex Sans KR'", query: "IBM+Plex+Sans+KR:wght@400;500;700", weights: [400, 500, 700] },
  { id: "song-myung", label: "송명", css: "'Song Myung'", query: "Song+Myung", weights: [400] },
];

export const FONT_ROLES = [
  { key: "menu", label: "메뉴" },
  { key: "hero", label: "히어로 큰 제목" },
  { key: "banner", label: "서브 비주얼 제목" },
  { key: "section", label: "섹션 제목" },
  { key: "card", label: "소제목 / 카드 제목" },
  { key: "body", label: "본문" },
  { key: "caption", label: "보조 설명" },
  { key: "button", label: "버튼" },
];

export const DEFAULT_FONTS = {
  menu: { family: "noto-sans", size: 15, weight: 700 },
  hero: { family: "noto-sans", size: 42, weight: 900 },
  banner: { family: "noto-sans", size: 34, weight: 500 },
  section: { family: "noto-sans", size: 30, weight: 900 },
  card: { family: "noto-sans", size: 20, weight: 900 },
  body: { family: "noto-sans", size: 16, weight: 400 },
  caption: { family: "noto-sans", size: 14, weight: 400 },
  button: { family: "noto-sans", size: 15, weight: 700 },
};

export const DEFAULT_APPEARANCE = { colors: DEFAULT_COLORS, fonts: DEFAULT_FONTS };

const CACHE_KEY = "appearance-v1";

export function mergeAppearance(saved) {
  const fonts = {};
  for (const role of Object.keys(DEFAULT_FONTS)) {
    fonts[role] = { ...DEFAULT_FONTS[role], ...(saved?.fonts?.[role] || {}) };
  }
  return { colors: { ...DEFAULT_COLORS, ...(saved?.colors || {}) }, fonts };
}

export function loadCachedAppearance() {
  try {
    return mergeAppearance(JSON.parse(localStorage.getItem(CACHE_KEY)));
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function cacheAppearance(appearance) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(appearance));
  } catch {
    /* 저장 불가 환경은 무시 */
  }
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  const n = parseInt(m ? m[1] : "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

export function buildStyleVars(appearance) {
  const { colors, fonts } = mergeAppearance(appearance);
  const vars = {
    "--primary": colors.primary,
    "--primary-rgb": hexToRgb(colors.primary).join(", "),
    "--primary-dark": mix(colors.primary, "#000000", 0.25),
    "--primary-light": mix(colors.primary, "#ffffff", 0.1),
    "--accent": colors.accent,
    "--accent-rgb": hexToRgb(colors.accent).join(", "),
    "--accent-hover": mix(colors.accent, "#ffffff", 0.18),
    "--accent-soft": mix(colors.accent, "#ffffff", 0.88),
    "--surface": colors.surface,
    "--surface-light": mix(colors.surface, "#ffffff", 0.6),
    "--text": colors.text,
    "--text-soft": colors.textSoft,
    "--line": colors.line,
  };
  for (const role of Object.keys(DEFAULT_FONTS)) {
    const f = fonts[role];
    const opt = FONT_OPTIONS.find((o) => o.id === f.family) || FONT_OPTIONS[0];
    vars[`--ff-${role}`] = `${opt.css}, "Malgun Gothic", sans-serif`;
    vars[`--fz-${role}`] = `calc(${Number(f.size) || 16} * var(--scale) * 1px)`;
    vars[`--fw-${role}`] = String(f.weight);
  }
  return vars;
}

export function ensureFonts(appearance) {
  const { fonts } = mergeAppearance(appearance);
  const ids = [...new Set(Object.values(fonts).map((f) => f.family))];
  const families = ids
    .map((id) => FONT_OPTIONS.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => `family=${o.query}`);
  const href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;

  let link = document.getElementById("appearance-fonts");
  if (!link) {
    link = document.createElement("link");
    link.id = "appearance-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function applyToRoot(appearance) {
  const root = document.documentElement;
  Object.entries(buildStyleVars(appearance)).forEach(([k, v]) => root.style.setProperty(k, v));
}
