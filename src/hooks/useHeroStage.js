import { useEffect, useState } from "react";

const RATIO = 16 / 9;

// 16:9 틀(stage)을 hero 영역(Wv×Hv px)에 놓는 위치와 크기를 계산한다.
//  - safe가 없으면 틀을 영역에 꽉 채우고(cover) 가운데 정렬한다.
//  - safe({x,y,w,h} = 틀 대비 %)가 있으면 그 사각형이 반드시 영역 안에 들어오도록 틀을 밀고,
//    그래도 안 들어갈 만큼 영역이 좁으면(극단적인 비율) 틀을 줄여서(축소) 넣는다. 남는 곳은 테마 색이 보인다.
export function computeStage(Wv, Hv, safe) {
  const W0 = Math.max(Wv, Hv * RATIO);
  const H0 = W0 / RATIO;

  if (!safe) {
    return { width: W0, height: H0, left: (Wv - W0) / 2, top: (Hv - H0) / 2, scale: 1 };
  }

  const sx = safe.x / 100;
  const sy = safe.y / 100;
  const sw = safe.w / 100;
  const sh = safe.h / 100;

  // 영역에 안전 사각형이 들어가려면 틀이 너무 커서는 안 된다 (k <= 1: 커버 크기 이하)
  const k = Math.min(1, Wv / (sw * W0), Hv / (sh * H0));
  const W = W0 * k;
  const H = H0 * k;

  const place = (view, size, start, len) => {
    // 틀이 영역보다 작으면(여백이 생기는 경우) 가운데에 둔다
    if (size <= view) return (view - size) / 2;
    const r0 = start * size;
    const r1 = (start + len) * size;
    // 영역을 꽉 채우면서(lo~hi) 안전 사각형이 보이는 범위. 가능하면 사각형을 가운데로.
    const lo = Math.max(view - size, -r0);
    const hi = Math.min(0, view - r1);
    const wanted = view / 2 - (r0 + r1) / 2;
    return Math.min(hi, Math.max(lo, wanted));
  };

  return {
    width: W,
    height: H,
    left: place(Wv, W, sx, sw),
    top: place(Hv, H, sy, sh),
    scale: k,
  };
}

// hero 섹션 크기를 지켜보고 틀의 인라인 스타일을 돌려준다. safe가 없으면 null(= CSS 기본 가운데 cover).
export default function useHeroStage(ref, safe) {
  const [size, setSize] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => {
      setSize((prev) =>
        prev && prev.w === el.clientWidth && prev.h === el.clientHeight
          ? prev
          : { w: el.clientWidth, h: el.clientHeight }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  if (!safe || !size || size.w <= 0 || size.h <= 0) return null;
  const s = computeStage(size.w, size.h, safe);
  return {
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    transform: "none",
  };
}
