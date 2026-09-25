import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";
import { useSettings } from "../../contexts/SettingsContext";
import { buildStyleVars } from "../../theme";

export default function PublicLayout() {
  const { settings, appearance } = useSettings();

  return (
    <div className="theme-scope public-root" style={buildStyleVars(appearance)}>
      <Header officeName={settings.officeName} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer settings={settings} />
      <FloatingCTA />
    </div>
  );
}
