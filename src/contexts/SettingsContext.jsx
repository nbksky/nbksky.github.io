import { createContext, useContext, useEffect, useState } from "react";
import { defaultSettings, getSettings } from "../api/content";

const SettingsContext = createContext({ settings: defaultSettings, loading: true, refresh: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
