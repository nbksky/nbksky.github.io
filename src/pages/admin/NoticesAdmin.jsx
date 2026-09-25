import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteNotice, listNotices } from "../../api/content";

function formatDate(ts) {
  if (!ts?.toDate) return "-";
  return ts.toDate().toLocaleDateString("ko-KR");
}

export default function NoticesAdmin() {
  const [items, setItems] = useState(null);

  const load = () => {
    listNotices().then(setItems).catch(() => setItems([]));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm("이 공지사항을 삭제할까요?")) return;
    await deleteNotice(id);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 style={{ marginBottom: 0 }}>공지사항 관리</h1>
        <Link to="/admin/notices/new" className="btn btn-primary">
          새 공지 작성
        </Link>
      </div>
      <div className="admin-panel">
        {items === null ? (
          <p className="state-msg">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="state-msg">등록된 공지사항이 없습니다.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>등록일</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td>{n.title}</td>
                  <td>{formatDate(n.createdAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/admin/notices/${n.id}/edit`}>수정</Link>
                      <button type="button" onClick={() => remove(n.id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
