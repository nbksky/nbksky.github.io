import { useEffect, useState } from "react";
import { getAppearance, saveAppearance } from "../../api/content";
import { useSettings } from "../../contexts/SettingsContext";
import BasicTab from "./settings/BasicTab";
import ColorsTab from "./settings/ColorsTab";
import FontsTab from "./settings/FontsTab";
import ImagesTab from "./settings/ImagesTab";
import "./settings/SettingsTabs.css";

const TABS = [
  { id: "basic", label: "기본정보/문구" },
  { id: "colors", label: "테마 색상" },
  { id: "images", label: "페이지 이미지" },
  { id: "fonts", label: "글꼴" },
];

export default function SettingsAdmin() {
  const { refresh } = useSettings();
  const [tab, setTab] = useState("basic");
  const [appearance, setAppearance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAppearance().then(setAppearance);
  }, []);

  const handleChange = (next) => {
    setMessage("");
    setAppearance(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveAppearance(appearance);
      await refresh();
      setMessage("저장되었습니다");
    } catch {
      setError("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const isAppearanceTab = tab === "colors" || tab === "fonts";

  return (
    <div>
      <h1>메인페이지 설정</h1>
      <div className="settings-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "is-active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-panel">
        {tab === "basic" && <BasicTab />}
        {tab === "images" && <ImagesTab />}
        {isAppearanceTab && !appearance && <p className="state-msg">불러오는 중...</p>}
        {tab === "colors" && appearance && <ColorsTab appearance={appearance} onChange={handleChange} />}
        {tab === "fonts" && appearance && <FontsTab appearance={appearance} onChange={handleChange} />}

        {isAppearanceTab && appearance && (
          <div className="settings-savebar">
            <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? "저장 중..." : "저장"}
            </button>
            {message && <span className="settings-savebar__msg">{message}</span>}
            {error && <span className="settings-savebar__err">{error}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
