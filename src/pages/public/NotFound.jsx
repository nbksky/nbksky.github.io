import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="content-body">
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
          페이지를 찾을 수 없습니다
        </h1>
        <Link to="/" className="btn btn-primary">
          홈으로 가기
        </Link>
      </div>
    </section>
  );
}
