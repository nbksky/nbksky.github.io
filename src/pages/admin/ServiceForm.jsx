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
import SectionsEditor from "../../components/admin/SectionsEditor";
import { cleanSections, getSections } from "../../utils/sections";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", summary: "", image: "" });
  const [sections, setSections] = useState([]);
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
          image: data.image || "",
        });
        // 예전 "상세 설명" 한 칸은 제목 없는 단락 하나로 불러온다 (저장하면 단락 형식으로 바뀐다)
        setSections(getSections(data));
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
      const data = { ...form, sections: cleanSections(sections), detail: "" };
      if (isEdit) {
        await updateService(id, data);
      } else {
        const existing = await listServices();
        // 삭제로 번호가 비어 있어도 겹치지 않도록 가장 큰 순서값 + 1
        const next = Math.max(-1, ...existing.map((s) => (Number.isFinite(s.order) ? s.order : -1))) + 1;
        const ref = await createService({ ...data, order: next });
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
        <SectionsEditor sections={sections} onChange={setSections} />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
