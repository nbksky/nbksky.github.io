import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getService, getSiteImage } from "../../api/content";
import { useSiteImageMeta } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import ServiceSections from "../../components/public/ServiceSections";
import { getSections, sectionImageKey } from "../../utils/sections";
import "./ContentPage.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(undefined);
  const [sectionImages, setSectionImages] = useState({}); // { 단락id: dataUrl }
  const ownBanner = useSiteImageMeta(`service_${id}`);
  const fallbackBanner = useSiteImageMeta("banner_services");

  useEffect(() => {
    let alive = true;
    getService(id)
      .then((svc) => {
        if (!alive) return;
        setService(svc);
        // 이미지가 있는 단락은 별도 문서에서 이미지를 읽어온다 (글은 먼저 보이고 이미지는 도착하는 대로 채워진다)
        getSections(svc)
          .filter((s) => s.image)
          .forEach((s) => {
            getSiteImage(sectionImageKey(id, s.id))
              .then((url) => alive && url && setSectionImages((m) => ({ ...m, [s.id]: url })))
              .catch(() => {});
          });
      })
      .catch(() => alive && setService(null));
    return () => {
      alive = false;
    };
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
          <ServiceSections
            sections={getSections(service).map((s) => (sectionImages[s.id] ? { ...s, imageUrl: sectionImages[s.id] } : s))}
          />
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
