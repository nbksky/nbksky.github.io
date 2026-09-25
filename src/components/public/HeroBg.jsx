// 히어로/배너 배경 이미지. 위치(x, y %)와 확대(zoom)를 적용한다.
export default function HeroBg({ image }) {
  const { dataUrl, x = 50, y = 50, zoom = 1 } = image;
  return (
    <div
      className="hero-bg"
      style={{
        backgroundImage: `url(${dataUrl})`,
        backgroundPosition: `${x}% ${y}%`,
        transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        transformOrigin: `${x}% ${y}%`,
      }}
    />
  );
}
