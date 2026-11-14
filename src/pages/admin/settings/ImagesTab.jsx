import { useEffect, useState } from "react";
import { getHeroLayout, getSettings, getSiteImageMeta, saveSettings, saveSiteImageMeta } from "../../../api/content";
import { useSettings } from "../../../contexts/SettingsContext";
import ImageUpload from "../../../components/admin/ImageUpload";
import HeroImageEditor from "../../../components/admin/HeroImageEditor";
import "./SettingsTabs.css";

const BANNER = { kind: "banner", maxWidth: 1600, maxBytes: 200 * 1024 };

// kind: hero/banner = 위치·확대 조절 가능한 배경 이미지, plain = 일반 사진
const GROUPS = [
  {
    title: "메인 페이지",
    slots: [
      {
        key: "hero",
        label: "메인 이미지",
        hint: "오버레이 없이 메인 상단 배경으로 표시됩니다. 배경 없는(투명) PNG는 테마 색 위에 올라갑니다. 미리보기에서 사진, 제목, 버튼을 직접 드래그해 위치를 정하세요.",
        opts: { kind: "hero", maxWidth: 1600, maxBytes: 300 * 1024 },
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
    title: "지도",
    slots: [
      {
        key: "map",
        label: "지도 사진 (홈 상담 섹션 + 오시는 길)",
        hint: "네이버 지도에서 사무소 위치를 화면 캡처해서 올리세요. 사진을 누르면 '기본정보/문구' 탭에 등록한 네이버 지도 링크로 연결됩니다.",
        opts: {
          kind: "plain",
          maxWidth: 1200,
          recommend:
            "권장 사이즈: 가로 1200px 이상의 가로형 (약 16:9). 사진은 잘리지 않고 원본 비율 그대로 표시됩니다. 지도 주변이 시간이 지나 바뀔 수 있으니 가끔 갱신해 주세요.",
        },
      },
    ],
  },
  {
    title: "본문 사진",
    slots: [
      {
        key: "about",
        label: "사무소 소개 페이지 본문 사진",
        opts: { kind: "plain", maxWidth: 1200 },
      },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.slots.map((s) => s.key));

export default function ImagesTab() {
  const { refresh } = useSettings();
  const [images, setImages] = useState(null);
  const [original, setOriginal] = useState(null);
  const [layout, setLayout] = useState(null);
  const [originalLayout, setOriginalLayout] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getSettings(), ...ALL_KEYS.map((k) => getSiteImageMeta(k))]).then(([site, ...metas]) => {
      const map = Object.fromEntries(ALL_KEYS.map((k, i) => [k, metas[i]]));
      setImages(map);
      setOriginal(map);
      const pos = getHeroLayout(site);
      setLayout(pos);
      setOriginalLayout(pos);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const changed = ALL_KEYS.filter((k) => images[k] !== original[k]);
      const posChanged = Object.keys(layout).some((k) => layout[k] !== originalLayout[k]);
      await Promise.all([
        ...changed.map((k) => saveSiteImageMeta(k, images[k])),
        ...(posChanged
          ? [
              saveSettings({
                heroTitleX: layout.titleX,
                heroTitleY: layout.titleY,
                heroBtnX: layout.btnX,
                heroBtnY: layout.btnY,
              }),
            ]
          : []),
      ]);
      setOriginal(images);
      setOriginalLayout(layout);
      if (posChanged) await refresh();
      setMessage(changed.length || posChanged ? "저장되었습니다" : "변경된 내용이 없습니다");
    } catch {
      setMessage("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (!images || !layout) return <p className="state-msg">불러오는 중...</p>;

  const setImage = (key, meta) => {
    setMessage("");
    setImages((m) => ({ ...m, [key]: meta }));
  };

  return (
    <div>
      {GROUPS.map((group) => (
        <div className="image-slot-group" key={group.title}>
          <h2>{group.title}</h2>
          {group.slots.map((slot) => {
            const { kind, ...opts } = slot.opts;
            return kind === "plain" ? (
              <ImageUpload
                key={slot.key}
                label={slot.label}
                hint={slot.hint}
                value={images[slot.key]?.dataUrl || ""}
                onChange={(url) => setImage(slot.key, url ? { dataUrl: url } : null)}
                {...opts}
              />
            ) : (
              <HeroImageEditor
                key={slot.key}
                kind={kind}
                label={slot.label}
                hint={slot.hint}
                value={images[slot.key]}
                onChange={(meta) => setImage(slot.key, meta)}
                {...(slot.key === "hero"
                  ? {
                      layout,
                      onLayoutChange: (next) => {
                        setMessage("");
                        setLayout(next);
                      },
                    }
                  : {})}
                {...opts}
              />
            );
          })}
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
