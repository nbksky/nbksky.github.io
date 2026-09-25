import { createContext, useContext, useEffect, useState } from "react";
import { defaultSettings, getAppearance, getSettings } from "../api/content";
import { DEFAULT_APPEARANCE, cacheAppearance, ensureFonts, loadCachedAppearance } from "../theme";

const SettingsContext = createContext({
  settings: defaultSettings,
  appearance: DEFAULT_APPEARANCE,
  loading: true,
  refresh: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [appearance, setAppearance] = useState(loadCachedAppearance);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [site, look] = await Promise.all([getSettings(), getAppearance()]);
      setSettings(site);
      setAppearance(look);
      cacheAppearance(look);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    ensureFonts(appearance);
  }, [appearance]);

  return (
    <SettingsContext.Provider value={{ settings, appearance, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
