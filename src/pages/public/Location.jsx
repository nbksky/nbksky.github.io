import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { useSiteImageMeta } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import "./ContentPage.css";

export default function Location() {
  const { settings } = useSettings();
  const banner = useSiteImageMeta("banner_location");

  return (
    <>
      <PageHero title="오시는 길" subtitle={settings.address} image={banner} />
      <section className="content-body">
        <div className="container">
          <div
            style={{
              height: 360,
              borderRadius: "var(--radius)",
              background:
                "repeating-linear-gradient(45deg, #eee0d0, #eee0d0 10px, #f5ece1 10px, #f5ece1 20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-soft)",
              fontWeight: 700,
              marginBottom: 30,
            }}
          >
            지도 영역 (관리자 설정 예정)
          </div>
          <div className="content-body__text">
            <p>
              <strong>주소</strong> : {settings.address}
            </p>
            <p>
              <strong>전화번호</strong> : {settings.phone}
            </p>
          </div>
          <div style={{ marginTop: 30 }}>
            <Link to="/consultation" className="btn btn-primary">
              문의하기 바로가기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
