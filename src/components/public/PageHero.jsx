import HeroBg from "./HeroBg";

// 사진 위에 덮는 테마 색(주색)의 진하기. 값이 없으면 예전과 같은 0.7.
const clampOverlay = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7);

export default function PageHero({ title, subtitle, image }) {
  const overlay = image ? clampOverlay(image.overlay) : 0.7;
  // 테마 색을 거의 덮지 않으면 밝은 사진 위에서도 글자가 읽히도록 그림자를 준다
  const readable = image && overlay < 0.5;
  return (
    <section
      className={`page-hero ${image ? "page-hero--image" : ""}${readable ? " page-hero--clear" : ""}`}
      style={image ? { "--hero-overlay": overlay } : undefined}
    >
      {image && <HeroBg image={image} />}
      <div className="container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
