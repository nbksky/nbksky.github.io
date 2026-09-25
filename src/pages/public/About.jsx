import { useSettings } from "../../contexts/SettingsContext";
import { useSiteImage, useSiteImageMeta } from "../../hooks/useSiteImages";
import PageHero from "../../components/public/PageHero";
import "./ContentPage.css";

export default function About() {
  const { settings } = useSettings();
  const aboutImage = useSiteImage("about");
  const banner = useSiteImageMeta("banner_about");

  return (
    <>
      <PageHero title="사무소 소개" subtitle={`${settings.officeName}를 소개합니다.`} image={banner} />
      <section className="content-body">
        <div className="container">
          {aboutImage && <img src={aboutImage} alt="" className="content-body__image" />}
          <div className="content-body__text">{settings.aboutText}</div>
        </div>
      </section>
    </>
  );
}
