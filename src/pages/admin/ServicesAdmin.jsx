import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteService, listServices, normalizeServiceOrder } from "../../api/content";

export default function ServicesAdmin() {
  const [items, setItems] = useState(null);

  // 불러올 때 순서값을 0,1,2…로 정리한다 (삭제로 비었거나 겹친 값이 있어도 ↑↓가 동작하도록)
  const load = () => {
    listServices()
      .then((list) => normalizeServiceOrder(list).catch(() => list))
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm("이 업무 분야를 삭제할까요?")) return;
    await deleteService(id);
    load();
  };

  const move = async (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(await normalizeServiceOrder(next));
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 style={{ marginBottom: 0 }}>업무분야 관리</h1>
        <Link to="/admin/services/new" className="btn btn-primary">
          새 업무분야 추가
        </Link>
      </div>
      <div className="admin-panel">
        {items === null ? (
          <p className="state-msg">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="state-msg">등록된 업무 분야가 없습니다.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>제목</th>
                <th>요약</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, idx) => (
                <tr key={s.id}>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}>
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 1)}
                        disabled={idx === items.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>{s.title}</td>
                  <td>{s.summary}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/admin/services/${s.id}/edit`}>수정</Link>
                      <button type="button" onClick={() => remove(s.id)}>
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
