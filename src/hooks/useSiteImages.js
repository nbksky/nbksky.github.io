import { useEffect, useState } from "react";
import { getSiteImageMeta } from "../api/content";

// { dataUrl, x, y, zoom } 또는 null
export function useSiteImageMeta(key) {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    getSiteImageMeta(key)
      .then((m) => alive && setMeta(m))
      .catch(() => alive && setMeta(null));
    return () => {
      alive = false;
    };
  }, [key]);

  return key ? meta : null;
}

export function useSiteImage(key) {
  return useSiteImageMeta(key)?.dataUrl || "";
}
