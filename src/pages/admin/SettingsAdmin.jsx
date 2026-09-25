import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../api/content";

const FIELDS = [
  { name: "officeName", label: "사무소명", type: "input" },
  { name: "repName", label: "대표자명", type: "input" },
  { name: "phone", label: "전화번호", type: "input" },
  { name: "address", label: "주소", type: "input" },
  { name: "heroTitle", label: "메인 히어로 제목 (줄바꿈 가능)", type: "textarea" },
  { name: "heroSubtitle", label: "메인 히어로 부제목", type: "textarea" },
  { name: "introTitle", label: "소개 영상 섹션 제목 (줄바꿈 가능)", type: "textarea" },
  { name: "introText", label: "소개 영상 섹션 설명", type: "textarea" },
  { name: "videoUrl", label: "소개 영상 URL (유튜브 embed 링크)", type: "input" },
  { name: "aboutText", label: "사무소 소개 페이지 본문", type: "textarea", rows: 10 },
];

export default function SettingsAdmin() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  const handleChange = (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="state-msg">불러오는 중...</p>;

  return (
    <div>
      <h1>메인페이지 설정</h1>
      <form className="admin-panel" onSubmit={handleSubmit}>
        {FIELDS.map((field) => (
          <div className="form-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows || 3}
                value={form[field.name] || ""}
                onChange={handleChange}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span style={{ marginLeft: 14, color: "var(--orange-500)", fontWeight: 700 }}>저장되었습니다</span>}
      </form>
    </div>
  );
}
