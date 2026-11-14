import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { mergeAppearance } from "../theme";
import { sectionImageKey } from "../utils/sections";

const SETTINGS_DOC = "settings/site";

export const defaultSettings = {
  officeName: "법률사무소 (사무소명을 입력하세요)",
  repName: "대표 변호사",
  phone: "02-000-0000",
  address: "주소를 입력해주세요",
  heroTitle: "당신의 어려움에\n가장 가까이 있는 법률사무소",
  heroSubtitle: "나만의 맞춤 상담으로 여러분의 고민에 대해 쉽고 자세하게 설명해드립니다.",
  introTitle: "법률사무소의\n이야기",
  introText:
    "나만의 개인 맞춤 상담으로 여러분의 고민에 대해\n쉽고 자세하게 설명해드립니다.",
  aboutText: "사무소 소개 내용을 관리자 페이지에서 입력해주세요.",
  videoUrl: "",
  mapUrl: "",
  notifyEmail: "",
  heroPosX: "left",
  heroPosY: "middle",
};

// ---------- 메인 히어로 제목/버튼 위치 ----------
// 16:9 "무대" 안의 위치(%). 0은 무대의 왼쪽/위쪽 끝, 100은 오른쪽/아래쪽 끝에 붙는다.
export const DEFAULT_HERO_LAYOUT = { titleX: 6, titleY: 35, btnX: 6, btnY: 71 };

// "꼭 보일 영역": 16:9 틀 안의 사각형(x, y, w, h = 틀 대비 %). 화면 비율이 달라도 이 영역이 잘리지 않게 틀을 맞춘다.
// 지정하지 않으면(null) 틀을 가운데 기준으로만 맞춘다.
export const DEFAULT_HERO_SAFE = { x: 25, y: 10, w: 50, h: 80 };

function validSafe(s) {
  if (!s || typeof s !== "object") return null;
  const { x, y, w, h } = s;
  if (![x, y, w, h].every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  if (w < 1 || h < 1) return null;
  return { x, y, w, h };
}

// 예전 3×3 선택값(heroPosX/heroPosY)을 쓰던 설정은 가까운 위치로 변환한다.
const LEGACY_X = { left: 6, center: 50, right: 94 };
const LEGACY_Y = { top: 5, middle: 35, bottom: 62 };

export function getHeroLayout(settings = {}) {
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const legacyX = LEGACY_X[settings.heroPosX];
  const legacyY = LEGACY_Y[settings.heroPosY];
  const titleX = num(settings.heroTitleX) ? settings.heroTitleX : (legacyX ?? DEFAULT_HERO_LAYOUT.titleX);
  const titleY = num(settings.heroTitleY) ? settings.heroTitleY : (legacyY ?? DEFAULT_HERO_LAYOUT.titleY);
  return {
    titleX,
    titleY,
    btnX: num(settings.heroBtnX) ? settings.heroBtnX : titleX,
    btnY: num(settings.heroBtnY) ? settings.heroBtnY : Math.min(96, titleY + 36),
    safe: validSafe(settings.heroSafe),
  };
}

// ---------- Settings ----------
export async function getSettings() {
  if (!db) return defaultSettings;
  const snap = await getDoc(doc(db, SETTINGS_DOC));
  if (!snap.exists()) return defaultSettings;
  return { ...defaultSettings, ...snap.data() };
}

export async function saveSettings(data) {
  await setDoc(doc(db, SETTINGS_DOC), data, { merge: true });
}

// ---------- Appearance (테마 색상 / 글꼴) ----------
export async function getAppearance() {
  if (!db) return mergeAppearance(null);
  const snap = await getDoc(doc(db, "settings/appearance"));
  return mergeAppearance(snap.exists() ? snap.data() : null);
}

export async function saveAppearance(appearance) {
  await setDoc(doc(db, "settings/appearance"), appearance);
}

// ---------- 사이트 이미지 ----------
// Firestore 문서 1MB 제한 때문에 사진 1장을 문서 1개(settings/img_<key>)로 저장하고 필요한 페이지에서만 읽는다.
// key: hero, about, banner_about, banner_location, banner_services, banner_notices, banner_consultation, service_<id>
// 문서: { dataUrl, x, y, zoom, offX, offY }
//  - x/y: 확대 기준점(0~100%), zoom: 배율(0.3~3), offX/offY: 틀 대비 이동량(%, 자유 이동). 없으면 가운데/1배/이동 없음.
//  - overlay: 서브 비주얼에 덮는 테마 색(주색)의 진하기(0~1). 0이면 원본 사진 그대로. 없으면 0.7(기존 동작).
const imageCache = new Map();

export const DEFAULT_OVERLAY = 0.7;
export const DEFAULT_IMAGE_ADJUST = { x: 50, y: 50, zoom: 1, offX: 0, offY: 0, overlay: DEFAULT_OVERLAY };

export async function getSiteImageMeta(key) {
  if (!db) return null;
  if (imageCache.has(key)) return imageCache.get(key);
  const snap = await getDoc(doc(db, `settings/img_${key}`));
  const data = snap.exists() ? snap.data() : null;
  const meta = data?.dataUrl ? { ...DEFAULT_IMAGE_ADJUST, ...data } : null;
  imageCache.set(key, meta);
  return meta;
}

export async function getSiteImage(key) {
  return (await getSiteImageMeta(key))?.dataUrl || "";
}

export async function saveSiteImageMeta(key, meta) {
  const ref = doc(db, `settings/img_${key}`);
  if (meta?.dataUrl) {
    const { dataUrl, x, y, zoom, offX, offY, overlay } = { ...DEFAULT_IMAGE_ADJUST, ...meta };
    await setDoc(ref, { dataUrl, x, y, zoom, offX, offY, overlay });
    imageCache.set(key, { dataUrl, x, y, zoom, offX, offY, overlay });
  } else {
    await deleteDoc(ref);
    imageCache.set(key, null);
  }
}

export async function saveSiteImage(key, dataUrl) {
  await saveSiteImageMeta(key, dataUrl ? { dataUrl } : null);
}

// ---------- Services (업무 분야) ----------
export async function listServices() {
  if (!db) return [];
  const q = query(collection(db, "services"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getService(id) {
  const snap = await getDoc(doc(db, "services", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// 순서값을 0,1,2… 로 정리한다 (list는 화면에 보이는 순서). 값이 달라진 항목만 저장하고 정리된 목록을 돌려준다.
// 삭제로 번호가 비거나 예전 버그로 겹친 순서값이 있어도 ↑↓가 항상 동작하게 한다.
export async function normalizeServiceOrder(list) {
  await Promise.all(list.filter((s, i) => s.order !== i).map((s) => updateService(s.id, { order: list.indexOf(s) })));
  return list.map((s, i) => ({ ...s, order: i }));
}

export async function createService(data) {
  return addDoc(collection(db, "services"), data);
}

export async function updateService(id, data) {
  return updateDoc(doc(db, "services", id), data);
}

export async function deleteService(id) {
  // 단락 이미지는 별도 문서에 있으니 업무분야 문서를 지우기 전에 어떤 단락에 이미지가 있었는지 읽어 둔다
  const existing = await getService(id).catch(() => null);
  const withImages = (existing?.sections || []).filter((s) => s && s.image && s.id);
  await deleteDoc(doc(db, "services", id));
  await Promise.all([
    saveSiteImage(`service_${id}`, ""),
    ...withImages.map((s) => saveSiteImage(sectionImageKey(id, s.id), "")),
  ]);
}

// ---------- Notices (공지사항) ----------
export async function listNotices() {
  if (!db) return [];
  const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getNotice(id) {
  const snap = await getDoc(doc(db, "notices", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createNotice(data) {
  return addDoc(collection(db, "notices"), { ...data, createdAt: serverTimestamp() });
}

export async function updateNotice(id, data) {
  return updateDoc(doc(db, "notices", id), data);
}

export async function deleteNotice(id) {
  return deleteDoc(doc(db, "notices", id));
}

// ---------- Consultations (상담신청) ----------
export async function submitConsultation(data) {
  return addDoc(collection(db, "consultations"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

export async function listConsultations() {
  if (!db) return [];
  const q = query(collection(db, "consultations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateConsultationStatus(id, status) {
  return updateDoc(doc(db, "consultations", id), { status });
}

export async function deleteConsultation(id) {
  return deleteDoc(doc(db, "consultations", id));
}
