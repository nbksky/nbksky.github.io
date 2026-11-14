import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createService,
  getService,
  getSiteImage,
  getSiteImageMeta,
  listServices,
  saveSiteImage,
  saveSiteImageMeta,
  updateService,
} from "../../api/content";
import ImageUpload from "../../components/admin/ImageUpload";
import HeroImageEditor from "../../components/admin/HeroImageEditor";
import SectionsEditor from "../../components/admin/SectionsEditor";
import { cleanSections, getSections, sectionImageKey, toStoredSection } from "../../utils/sections";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", summary: "", image: "" });
  const [sections, setSections] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // 불러온 단락 이미지 { 단락id: dataUrl } — 저장할 때 바뀐 것만 쓰고, 지운 것은 삭제하려고 기억해 둔다
  const loadedImages = useRef({});

  useEffect(() => {
    if (!isEdit) return;
    Promise.all([getService(id), getSiteImageMeta(`service_${id}`)]).then(async ([data, bannerMeta]) => {
      if (data) {
        setForm({
          title: data.title,
          summary: data.summary,
          image: data.image || "",
        });
        // 예전 "상세 설명" 한 칸은 제목 없는 단락 하나로 불러온다 (저장하면 단락 형식으로 바뀐다)
        const list = getSections(data);
        // 이미지가 있는 단락은 별도 문서에서 이미지를 읽어 붙인다
        const withImages = await Promise.all(
          list.map(async (s) => {
            if (!s.image) return s;
            const imageUrl = await getSiteImage(sectionImageKey(id, s.id)).catch(() => "");
            return { ...s, imageUrl };
          })
        );
        loadedImages.current = Object.fromEntries(withImages.filter((s) => s.imageUrl).map((s) => [s.id, s.imageUrl]));
        setSections(withImages);
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
    setError("");
    try {
      let serviceId = id;
      const cleaned = cleanSections(sections);
      const data = { ...form, sections: cleaned.map(toStoredSection), detail: "" };
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

      // 단락 이미지: 바뀐 것만 저장하고, 지워졌거나 삭제된 단락의 이미지는 문서를 지운다
      const before = loadedImages.current;
      const after = Object.fromEntries(cleaned.filter((s) => s.imageUrl).map((s) => [s.id, s.imageUrl]));
      const jobs = [];
      for (const [sid, url] of Object.entries(after)) {
        if (before[sid] !== url) jobs.push(saveSiteImage(sectionImageKey(serviceId, sid), url));
      }
      for (const sid of Object.keys(before)) {
        if (!(sid in after)) jobs.push(saveSiteImage(sectionImageKey(serviceId, sid), ""));
      }
      await Promise.all(jobs);
      loadedImages.current = after;

      navigate("/admin/services");
    } catch (err) {
      setError(`저장 중 오류가 발생했습니다. (${err?.message || "알 수 없는 오류"})`);
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
        {error && <p style={{ color: "#c0392b", marginTop: 12, fontSize: 14 }}>{error}</p>}
      </form>
    </div>
  );
}
