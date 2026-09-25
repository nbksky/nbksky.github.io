import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";
import { useSettings } from "../../contexts/SettingsContext";

export default function PublicLayout() {
  const { settings } = useSettings();

  return (
    <>
      <Header officeName={settings.officeName} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer settings={settings} />
      <FloatingCTA />
    </>
  );
}
