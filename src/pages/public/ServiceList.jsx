import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listServices } from "../../api/content";
import "./ServiceList.css";

export default function ServiceList() {
  const [services, setServices] = useState(null);

  useEffect(() => {
    listServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>업무 분야</h1>
          <p>전문 분야별 상담을 안내해드립니다.</p>
        </div>
      </section>
      <section className="service-list">
        <div className="container">
          {services === null ? (
            <p className="state-msg">불러오는 중...</p>
          ) : services.length === 0 ? (
            <p className="state-msg">등록된 업무 분야가 없습니다.</p>
          ) : (
            <div className="service-list__grid">
              {services.map((s) => (
                <Link to={`/services/${s.id}`} key={s.id} className="service-list__card">
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span>자세히 보기 →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
