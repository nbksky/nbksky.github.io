import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNotice, getNotice, updateNotice } from "../../api/content";

export default function NoticeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", pinned: false });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getNotice(id).then((data) => {
      if (data) setForm({ title: data.title, content: data.content, pinned: Boolean(data.pinned) });
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateNotice(id, form);
      } else {
        await createNotice(form);
      }
      navigate("/admin/notices");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="state-msg">불러오는 중...</p>;

  return (
    <div>
      <h1>{isEdit ? "공지사항 수정" : "새 공지 작성"}</h1>
      <form className="admin-panel" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            rows={10}
            value={form.content}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input
            id="pinned"
            name="pinned"
            type="checkbox"
            checked={form.pinned}
            onChange={handleChange}
            style={{ width: "auto" }}
          />
          <label htmlFor="pinned" style={{ margin: 0 }}>
            상단 고정
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
