import { useSettings } from "../../contexts/SettingsContext";
import "./ContentPage.css";

export default function About() {
  const { settings } = useSettings();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>사무소 소개</h1>
          <p>{settings.officeName}를 소개합니다.</p>
        </div>
      </section>
      <section className="content-body">
        <div className="container">
          <div className="content-body__text">{settings.aboutText}</div>
        </div>
      </section>
    </>
  );
}
