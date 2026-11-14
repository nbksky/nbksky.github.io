import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { getHeroLayout, listServices, listNotices } from "../../api/content";
import { useSiteImage, useSiteImageMeta } from "../../hooks/useSiteImages";
import HeroBg from "../../components/public/HeroBg";
import MapLink from "../../components/public/MapLink";
import SectionDots from "../../components/public/SectionDots";
import "./Home.css";

export default function Home() {
  const { settings } = useSettings();
  const heroImage = useSiteImageMeta("hero");
  const mapImage = useSiteImage("map");
  const [services, setServices] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    listServices().then(setServices).catch(() => setServices([]));
    listNotices().then((list) => setNotices(list.slice(0, 3))).catch(() => setNotices([]));
  }, []);

  // 홈에서만 섹션 단위 스크롤 스냅을 켠다 (다른 페이지로 이동하면 해제)
  useEffect(() => {
    document.documentElement.classList.add("snap-home");
    return () => document.documentElement.classList.remove("snap-home");
  }, []);

  const sections = [
    { id: "hero", label: "메인" },
    ...(settings.videoUrl ? [{ id: "video", label: "소개 영상" }] : []),
    { id: "services", label: "업무 분야" },
    { id: "contact", label: "상담 신청" },
    ...(notices.length > 0 ? [{ id: "notices", label: "공지사항" }] : []),
  ];
  const layout = getHeroLayout(settings);
  // 위치가 왼쪽/오른쪽에 치우쳐 있으면 글자도 그쪽으로 정렬한다
  const alignOf = (x) => (x < 34 ? "left" : x > 66 ? "right" : "center");
  const lastId = sections[sections.length - 1].id;
  const snap = (id) => `snap-section${id === lastId ? " snap-section--last" : ""}`;
  const scrollToNext = () =>
    document.getElementById(sections[1].id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <SectionDots sections={sections} />

      <section
        id="hero"
        className={`home-hero ${heroImage ? "home-hero--image" : ""} ${snap("hero")}`}
      >
        {/* 사진·제목·버튼은 16:9 무대 안에서 같은 비율로 움직인다 (관리자 미리보기와 동일) */}
        <div className="hero-stage">
          {heroImage && <HeroBg image={heroImage} />}
          <div
            className={`hero-item home-hero__inner hero-align-${alignOf(layout.titleX)}`}
            style={{ "--x": layout.titleX, "--y": layout.titleY }}
          >
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
          </div>
          <div
            className={`hero-item home-hero__actions hero-align-${alignOf(layout.btnX)}`}
            style={{ "--x": layout.btnX, "--y": layout.btnY }}
          >
            <Link to="/consultation" className="btn btn-primary">
              상담 신청하기
            </Link>
            <Link to="/services" className="btn btn-outline">
              업무 분야 보기
            </Link>
          </div>
        </div>
        <button type="button" className="home-hero__scroll" onClick={scrollToNext}>
          SCROLL
        </button>
      </section>

      {settings.videoUrl ? (
        <section id="video" className={`home-video ${snap("video")}`}>
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

      <section id="services" className={`home-services ${snap("services")}`}>
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

      <section id="contact" className={`home-contact ${snap("contact")}`}>
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
          <MapLink url={settings.mapUrl} address={settings.address} image={mapImage} />
        </div>
      </section>

      {notices.length > 0 && (
        <section id="notices" className={`home-notices ${snap("notices")}`}>
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
