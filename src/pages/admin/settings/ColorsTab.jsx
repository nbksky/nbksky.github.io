import { COLOR_FIELDS, DEFAULT_COLORS, rgbToHex } from "../../../theme";
import ThemePreview from "./ThemePreview";
import "./SettingsTabs.css";

function hexToRgbArray(hex) {
  const n = parseInt((hex || "#000000").slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function ColorField({ field, value, onChange }) {
  const rgb = hexToRgbArray(value);
  const setChannel = (i, v) => {
    const next = [...rgb];
    next[i] = Math.max(0, Math.min(255, Number(v) || 0));
    onChange(rgbToHex(next));
  };

  return (
    <div className="color-field">
      <div className="color-field__head">
        <div>
          <strong>{field.label}</strong>
          <span>{field.hint}</span>
        </div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${field.label} 색상 선택`}
        />
      </div>
      {["R", "G", "B"].map((ch, i) => (
        <div className="color-field__row" key={ch}>
          <span className={`color-field__ch color-field__ch--${ch}`}>{ch}</span>
          <input
            type="range"
            min={0}
            max={255}
            value={rgb[i]}
            onChange={(e) => setChannel(i, e.target.value)}
          />
          <input
            type="number"
            min={0}
            max={255}
            value={rgb[i]}
            onChange={(e) => setChannel(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default function ColorsTab({ appearance, onChange }) {
  const setColor = (key) => (hex) =>
    onChange({ ...appearance, colors: { ...appearance.colors, [key]: hex } });

  return (
    <div className="settings-split">
      <div className="settings-split__main">
        {COLOR_FIELDS.map((field) => (
          <ColorField
            key={field.key}
            field={field}
            value={appearance.colors[field.key]}
            onChange={setColor(field.key)}
          />
        ))}
        <button
          type="button"
          className="settings-reset"
          onClick={() => onChange({ ...appearance, colors: { ...DEFAULT_COLORS } })}
        >
          색상 기본값으로 되돌리기
        </button>
      </div>
      <div className="settings-split__side">
        <ThemePreview appearance={appearance} />
      </div>
    </div>
  );
}
