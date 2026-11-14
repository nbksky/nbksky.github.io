import { useEffect, useState } from "react";
import "./SectionDots.css";

// 홈 섹션 점 네비게이션. 화면 가운데를 지나는 섹션을 현재 위치로 표시하고, 점을 누르면 해당 섹션으로 이동한다.
export default function SectionDots({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  const key = sections.map((s) => s.id).join(",");

  useEffect(() => {
    const targets = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className="section-dots" aria-label="페이지 섹션">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={active === s.id ? "is-active" : ""}
          aria-label={s.label}
          aria-current={active === s.id ? "true" : undefined}
          title={s.label}
          onClick={() => go(s.id)}
        />
      ))}
    </nav>
  );
}
