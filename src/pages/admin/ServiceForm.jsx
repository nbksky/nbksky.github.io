import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createService,
  getService,
  getSiteImageMeta,
  listServices,
  saveSiteImageMeta,
  updateService,
} from "../../api/content";
import ImageUpload from "../../components/admin/ImageUpload";
import HeroImageEditor from "../../components/admin/HeroImageEditor";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", summary: "", detail: "", image: "" });
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    Promise.all([getService(id), getSiteImageMeta(`service_${id}`)]).then(([data, bannerMeta]) => {
      if (data) {
        setForm({
          title: data.title,
          summary: data.summary,
          detail: data.detail || "",
          image: data.image || "",
        });
      }
      setBanner(bannerMeta);
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let serviceId = id;
      if (isEdit) {
        await updateService(id, form);
      } else {
        const existing = await listServices();
        const ref = await createService({ ...form, order: existing.length });
        serviceId = ref.id;
      }
      await saveSiteImageMeta(`service_${serviceId}`, banner);
      navigate("/admin/services");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="state-msg">불러오는 중...</p>;

  return (
    <div>
      <h1>{isEdit ? "업무분야 수정" : "새 업무분야 추가"}</h1>
      <form className="admin-panel" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="summary">한 줄 요약 (목록/카드에 표시)</label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            value={form.summary}
            onChange={handleChange}
            required
          />
        </div>
        <ImageUpload
          label="대표 이미지 (선택)"
          hint="홈/업무분야 목록의 카드에 표시됩니다."
          value={form.image}
          onChange={(image) => setForm((f) => ({ ...f, image }))}
        />
        <HeroImageEditor
          kind="banner"
          label="서브 비주얼 (선택)"
          hint="이 업무분야 상세 페이지 상단 배너입니다. 없으면 '업무분야 목록' 배너를 사용합니다."
          value={banner}
          onChange={setBanner}
          maxWidth={1600}
          maxBytes={200 * 1024}
        />
        <div className="form-field">
          <label htmlFor="detail">상세 설명 (상세 페이지에 표시)</label>
          <textarea
            id="detail"
            name="detail"
            rows={12}
            value={form.detail}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
