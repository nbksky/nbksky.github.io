import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listServices } from "../../api/content";
import { useSiteImage } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import "./ServiceList.css";

export default function ServiceList() {
  const [services, setServices] = useState(null);
  const banner = useSiteImage("banner_services");

  useEffect(() => {
    listServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <PageHero title="업무 분야" subtitle="전문 분야별 상담을 안내해드립니다." image={banner} />
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
                  {s.image && <img src={s.image} alt="" className="service-list__img" />}
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
