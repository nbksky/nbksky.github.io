import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createService, getService, listServices, updateService } from "../../api/content";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", summary: "", detail: "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getService(id).then((data) => {
      if (data) setForm({ title: data.title, summary: data.summary, detail: data.detail || "" });
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
      if (isEdit) {
        await updateService(id, form);
      } else {
        const existing = await listServices();
        await createService({ ...form, order: existing.length });
      }
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
