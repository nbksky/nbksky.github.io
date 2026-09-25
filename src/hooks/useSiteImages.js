import { useEffect, useState } from "react";
import { getSiteImage } from "../api/content";

export function useSiteImage(key) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!key) return;
    let alive = true;
    getSiteImage(key)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(""));
    return () => {
      alive = false;
    };
  }, [key]);

  return key ? url : "";
}
