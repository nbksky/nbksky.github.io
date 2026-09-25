import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { listServices, listNotices } from "../../api/content";
import { useSiteImage } from "../../hooks/useSiteImages";
import "./Home.css";

export default function Home() {
  const { settings } = useSettings();
  const heroImage = useSiteImage("hero");
  const [services, setServices] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    listServices().then(setServices).catch(() => setServices([]));
    listNotices().then((list) => setNotices(list.slice(0, 3))).catch(() => setNotices([]));
  }, []);

  return (
    <>
      <section
        className={`home-hero ${heroImage ? "home-hero--image" : ""}`}
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="container home-hero__inner">
          <p className="section-eyebrow" style={{ color: "var(--accent-hover)" }}>
            {settings.repName}
          </p>
          <h1>
            {settings.heroTitle.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </h1>
          <p className="home-hero__subtitle">{settings.heroSubtitle}</p>
          <div className="home-hero__actions">
            <Link to="/consultation" className="btn btn-primary">
              상담 신청하기
            </Link>
            <Link to="/services" className="btn btn-outline">
              업무 분야 보기
            </Link>
          </div>
        </div>
      </section>

      {settings.videoUrl ? (
        <section className="home-video">
          <div className="container home-video__inner">
            <div>
              <p className="section-eyebrow">{settings.officeName}의 이야기</p>
              <h2 className="section-heading">
                {settings.introTitle.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </h2>
              <p className="home-video__desc">{settings.introText}</p>
            </div>
            <div className="home-video__frame">
              <iframe
                src={settings.videoUrl}
                title="소개 영상"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-services">
        <div className="container">
          <p className="section-eyebrow">SERVICES</p>
          <h2 className="section-heading">업무 분야</h2>

          {services.length === 0 ? (
            <p className="state-msg">등록된 업무 분야가 없습니다.</p>
          ) : (
            <div className="home-services__grid">
              {services.map((s, idx) => (
                <Link
                  to={`/services/${s.id}`}
                  key={s.id}
                  className="home-service-card"
                  style={{
                    background: idx % 2 === 0 ? "var(--primary)" : "var(--accent)",
                  }}
                >
                  {s.image && <img src={s.image} alt="" className="home-service-card__img" />}
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span className="home-service-card__more">자세히 보기 →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-contact">
        <div className="container home-contact__inner">
          <div>
            <p className="section-eyebrow">CONSULTATION</p>
            <h2 className="section-heading">상담 신청하기</h2>
            <p className="home-contact__desc">{settings.heroSubtitle}</p>
            <div className="home-contact__actions">
              <Link to="/consultation" className="btn btn-dark">
                문의하기 바로가기
              </Link>
            </div>
            <div className="home-contact__info">
              <p>{settings.phone}</p>
              <p>{settings.address}</p>
            </div>
          </div>
          <div className="home-contact__map-placeholder">지도 영역 (관리자 설정 예정)</div>
        </div>
      </section>

      {notices.length > 0 && (
        <section className="home-notices">
          <div className="container">
            <p className="section-eyebrow">NOTICE</p>
            <h2 className="section-heading">공지사항</h2>
            <ul className="home-notices__list">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link to={`/notices/${n.id}`}>{n.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
