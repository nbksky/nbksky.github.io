import { DEFAULT_FONTS, FONT_OPTIONS, FONT_ROLES } from "../../../theme";
import ThemePreview from "./ThemePreview";
import "./SettingsTabs.css";

function nearest(list, target) {
  return list.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
}

export default function FontsTab({ appearance, onChange }) {
  const setRole = (role, patch) => {
    const current = appearance.fonts[role];
    let next = { ...current, ...patch };
    if (patch.family) {
      const opt = FONT_OPTIONS.find((o) => o.id === patch.family);
      next.weight = nearest(opt.weights, current.weight);
    }
    onChange({ ...appearance, fonts: { ...appearance.fonts, [role]: next } });
  };

  return (
    <div className="settings-split">
      <div className="settings-split__main">
        <p className="settings-note">
          크기는 PC 기준(px)이며, 모바일에서는 자동으로 80%로 줄어듭니다.
        </p>
        {FONT_ROLES.map((role) => {
          const f = appearance.fonts[role.key];
          const opt = FONT_OPTIONS.find((o) => o.id === f.family) || FONT_OPTIONS[0];
          return (
            <div className="font-row" key={role.key}>
              <strong>{role.label}</strong>
              <select
                value={f.family}
                onChange={(e) => setRole(role.key, { family: e.target.value })}
                aria-label={`${role.label} 글꼴`}
              >
                {FONT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="font-row__size">
                <input
                  type="number"
                  min={8}
                  max={100}
                  value={f.size}
                  onChange={(e) => setRole(role.key, { size: Number(e.target.value) })}
                  aria-label={`${role.label} 크기`}
                />
                px
              </label>
              <select
                value={f.weight}
                onChange={(e) => setRole(role.key, { weight: Number(e.target.value) })}
                aria-label={`${role.label} 굵기`}
              >
                {opt.weights.map((w) => (
                  <option key={w} value={w}>
                    굵기 {w}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <button
          type="button"
          className="settings-reset"
          onClick={() => onChange({ ...appearance, fonts: JSON.parse(JSON.stringify(DEFAULT_FONTS)) })}
        >
          글꼴 기본값으로 되돌리기
        </button>
      </div>
      <div className="settings-split__side">
        <ThemePreview appearance={appearance} />
      </div>
    </div>
  );
}
