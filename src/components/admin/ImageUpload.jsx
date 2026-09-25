import { useRef, useState } from "react";
import { resizeImage } from "../../utils/image";
import "./ImageUpload.css";

export default function ImageUpload({
  label,
  hint,
  recommend = "권장 사이즈: 가로 1200px 이상, 비율 자유 (사진 전체가 잘리지 않고 표시됩니다). 가로 1200px보다 큰 사진은 자동으로 줄여서 저장됩니다.",
  value,
  onChange,
  maxWidth,
  maxBytes,
  aspect,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const previewStyle = aspect ? { width: 320, height: "auto", aspectRatio: aspect } : undefined;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await resizeImage(file, { maxWidth, maxBytes, aspect }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-field">
      <label>{label}</label>
      {hint && <p className="image-upload__hint">{hint}</p>}
      {recommend && <p className="image-upload__recommend">{recommend}</p>}
      <div className="image-upload">
        {value ? (
          <img src={value} alt="" className="image-upload__preview" style={previewStyle} />
        ) : (
          <div className="image-upload__empty" style={previewStyle}>
            등록된 사진 없음
          </div>
        )}
        <div className="image-upload__actions">
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "처리 중..." : value ? "사진 변경" : "사진 선택"}
          </button>
          {value && (
            <button type="button" className="image-upload__remove" onClick={() => onChange("")}>
              삭제
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {error && <p className="image-upload__error">{error}</p>}
    </div>
  );
}
