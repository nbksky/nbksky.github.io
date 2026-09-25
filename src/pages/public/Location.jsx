import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { useSiteImage, useSiteImageMeta } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import MapLink from "../../components/public/MapLink";
import "./ContentPage.css";

export default function Location() {
  const { settings } = useSettings();
  const banner = useSiteImageMeta("banner_location");
  const mapImage = useSiteImage("map");

  return (
    <>
      <PageHero title="오시는 길" subtitle={settings.address} image={banner} />
      <section className="content-body">
        <div className="container">
          <div style={{ marginBottom: 30 }}>
            <MapLink url={settings.mapUrl} address={settings.address} image={mapImage} height={360} />
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
