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
};

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
// 문서: { dataUrl, x, y, zoom } — x/y는 표시 위치(0~100%), zoom은 확대 배율(1~3). 없으면 가운데/1배.
const imageCache = new Map();

export const DEFAULT_IMAGE_ADJUST = { x: 50, y: 50, zoom: 1 };

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
    const { dataUrl, x, y, zoom } = { ...DEFAULT_IMAGE_ADJUST, ...meta };
    await setDoc(ref, { dataUrl, x, y, zoom });
    imageCache.set(key, { dataUrl, x, y, zoom });
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

export async function createService(data) {
  return addDoc(collection(db, "services"), data);
}

export async function updateService(id, data) {
  return updateDoc(doc(db, "services", id), data);
}

export async function deleteService(id) {
  await deleteDoc(doc(db, "services", id));
  await saveSiteImage(`service_${id}`, "");
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
