import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listNotices } from "../../api/content";
import "./NoticeList.css";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("ko-KR");
}

export default function NoticeList() {
  const [notices, setNotices] = useState(null);

  useEffect(() => {
    listNotices().then(setNotices).catch(() => setNotices([]));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>공지사항</h1>
          <p>소식과 안내사항을 확인하세요.</p>
        </div>
      </section>
      <section className="notice-list">
        <div className="container">
          {notices === null ? (
            <p className="state-msg">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="state-msg">등록된 공지사항이 없습니다.</p>
          ) : (
            <ul className="notice-list__ul">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link to={`/notices/${n.id}`}>
                    <span className="notice-list__title">
                      {n.pinned && <em>고정</em>}
                      {n.title}
                    </span>
                    <span className="notice-list__date">{formatDate(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
