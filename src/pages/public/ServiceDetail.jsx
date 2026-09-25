import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getService } from "../../api/content";
import { useSiteImage } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import "./ContentPage.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(undefined);
  const ownBanner = useSiteImage(`service_${id}`);
  const fallbackBanner = useSiteImage("banner_services");

  useEffect(() => {
    getService(id).then(setService).catch(() => setService(null));
  }, [id]);

  if (service === undefined) {
    return <p className="state-msg">불러오는 중...</p>;
  }

  if (service === null) {
    return (
      <section className="content-body">
        <div className="container">
          <p className="state-msg">존재하지 않는 업무 분야입니다.</p>
          <Link to="/services" className="btn btn-dark">
            목록으로
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero title={service.title} subtitle={service.summary} image={ownBanner || fallbackBanner} />
      <section className="content-body">
        <div className="container">
          {service.image && <img src={service.image} alt="" className="content-body__image" />}
          <div className="content-body__text">{service.detail}</div>
          <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
            <Link to="/consultation" className="btn btn-primary">
              상담 신청하기
            </Link>
            <Link to="/services" className="btn btn-outline" style={{ color: "var(--primary)", borderColor: "var(--line)" }}>
              목록으로
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
