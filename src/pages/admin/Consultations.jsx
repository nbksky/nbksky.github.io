import { useEffect, useState } from "react";
import {
  deleteConsultation,
  listConsultations,
  updateConsultationStatus,
} from "../../api/content";

function formatDate(ts) {
  if (!ts?.toDate) return "-";
  return ts.toDate().toLocaleString("ko-KR");
}

export default function Consultations() {
  const [items, setItems] = useState(null);

  const load = () => {
    listConsultations().then(setItems).catch(() => setItems([]));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    await updateConsultationStatus(id, "read");
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("이 상담신청을 삭제할까요?")) return;
    await deleteConsultation(id);
    load();
  };

  return (
    <div>
      <h1>상담신청 접수</h1>
      <div className="admin-panel">
        {items === null ? (
          <p className="state-msg">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="state-msg">접수된 상담신청이 없습니다.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>이름</th>
                <th>연락처</th>
                <th>이메일</th>
                <th>내용</th>
                <th>접수일시</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span
                      className={`admin-badge ${
                        c.status === "new" ? "admin-badge--new" : "admin-badge--read"
                      }`}
                    >
                      {c.status === "new" ? "신규" : "확인함"}
                    </span>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email || "-"}</td>
                  <td style={{ maxWidth: 280, whiteSpace: "pre-line" }}>{c.message}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      {c.status === "new" && (
                        <button type="button" onClick={() => markRead(c.id)}>
                          확인 처리
                        </button>
                      )}
                      <button type="button" onClick={() => remove(c.id)}>
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
