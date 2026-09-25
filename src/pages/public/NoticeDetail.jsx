import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNotice } from "../../api/content";
import "./ContentPage.css";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("ko-KR");
}

export default function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(undefined);

  useEffect(() => {
    getNotice(id).then(setNotice).catch(() => setNotice(null));
  }, [id]);

  if (notice === undefined) {
    return <p className="state-msg">불러오는 중...</p>;
  }

  if (notice === null) {
    return (
      <section className="content-body">
        <div className="container">
          <p className="state-msg">존재하지 않는 게시글입니다.</p>
          <Link to="/notices" className="btn btn-dark">
            목록으로
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{notice.title}</h1>
          <p>{formatDate(notice.createdAt)}</p>
        </div>
      </section>
      <section className="content-body">
        <div className="container">
          <div className="content-body__text">{notice.content}</div>
          <div style={{ marginTop: 40 }}>
            <Link to="/notices" className="btn btn-dark">
              목록으로
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
