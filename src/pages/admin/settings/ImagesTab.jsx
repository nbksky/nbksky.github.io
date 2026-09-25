import { useEffect, useState } from "react";
import { getSiteImage, saveSiteImage } from "../../../api/content";
import ImageUpload from "../../../components/admin/ImageUpload";
import "./SettingsTabs.css";

const BANNER = { maxWidth: 1600, maxBytes: 200 * 1024, aspect: 4 };

const GROUPS = [
  {
    title: "메인 페이지",
    slots: [
      {
        key: "hero",
        label: "메인 이미지",
        hint: "오버레이 없이 원본 그대로 메인 상단에 표시됩니다.",
        opts: { maxWidth: 1600, maxBytes: 300 * 1024 },
      },
    ],
  },
  {
    title: "서브 비주얼 (주색 70% 오버레이가 덮입니다)",
    slots: [
      { key: "banner_about", label: "사무소 소개", opts: BANNER },
      { key: "banner_location", label: "오시는 길", opts: BANNER },
      {
        key: "banner_services",
        label: "업무 분야 (목록 + 개별 배너가 없는 상세)",
        hint: "업무분야마다 다른 배너는 '업무분야 관리'에서 등록합니다.",
        opts: BANNER,
      },
      { key: "banner_notices", label: "공지사항 (목록 + 상세)", opts: BANNER },
      { key: "banner_consultation", label: "상담신청", opts: BANNER },
    ],
  },
  {
    title: "본문 사진",
    slots: [{ key: "about", label: "사무소 소개 페이지 본문 사진", opts: { maxWidth: 1200 } }],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.slots.map((s) => s.key));

export default function ImagesTab() {
  const [images, setImages] = useState(null);
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all(ALL_KEYS.map((k) => getSiteImage(k))).then((urls) => {
      const map = Object.fromEntries(ALL_KEYS.map((k, i) => [k, urls[i]]));
      setImages(map);
      setOriginal(map);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const changed = ALL_KEYS.filter((k) => images[k] !== original[k]);
      await Promise.all(changed.map((k) => saveSiteImage(k, images[k])));
      setOriginal(images);
      setMessage(changed.length ? "저장되었습니다" : "변경된 사진이 없습니다");
    } catch {
      setMessage("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (!images) return <p className="state-msg">불러오는 중...</p>;

  return (
    <div>
      {GROUPS.map((group) => (
        <div className="image-slot-group" key={group.title}>
          <h2>{group.title}</h2>
          {group.slots.map((slot) => (
            <ImageUpload
              key={slot.key}
              label={slot.label}
              hint={slot.hint}
              value={images[slot.key]}
              onChange={(url) => {
                setMessage("");
                setImages((m) => ({ ...m, [slot.key]: url }));
              }}
              {...slot.opts}
            />
          ))}
        </div>
      ))}
      <div className="settings-savebar">
        <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? "저장 중..." : "저장"}
        </button>
        {message && <span className="settings-savebar__msg">{message}</span>}
      </div>
    </div>
  );
}
