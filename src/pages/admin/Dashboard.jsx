import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listConsultations, listNotices, listServices } from "../../api/content";

export default function Dashboard() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([listConsultations(), listNotices(), listServices()]).then(
      ([consultations, notices, services]) => {
        setCounts({
          newConsultations: consultations.filter((c) => c.status === "new").length,
          totalConsultations: consultations.length,
          notices: notices.length,
          services: services.length,
        });
      }
    );
  }, []);

  return (
    <div>
      <h1>대시보드</h1>
      {!counts ? (
        <p className="state-msg">불러오는 중...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <Link to="/admin/consultations" className="admin-panel">
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 8 }}>
              신규 상담신청
            </p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "var(--orange-500)" }}>
              {counts.newConsultations}
            </p>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
              전체 {counts.totalConsultations}건
            </p>
          </Link>
          <Link to="/admin/notices" className="admin-panel">
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 8 }}>
              공지사항
            </p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "var(--brown-900)" }}>
              {counts.notices}
            </p>
          </Link>
          <Link to="/admin/services" className="admin-panel">
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 8 }}>
              업무 분야
            </p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "var(--brown-900)" }}>
              {counts.services}
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
