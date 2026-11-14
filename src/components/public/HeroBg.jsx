// 히어로/배너 배경 이미지. 확대(zoom, 0.3~3배)와 자유 이동(offX/offY = 틀 대비 %)을 적용한다.
// 사진이 틀보다 작거나 밀려서 생긴 빈 곳은 아래 깔린 테마 색 배경이 보인다.
export default function HeroBg({ image }) {
  const { dataUrl, x = 50, y = 50, zoom = 1, offX = 0, offY = 0 } = image;
  const transforms = [];
  if (offX || offY) transforms.push(`translate(${offX}%, ${offY}%)`);
  if (zoom !== 1) transforms.push(`scale(${zoom})`);
  return (
    <div
      className="hero-bg"
      style={{
        backgroundImage: `url(${dataUrl})`,
        backgroundPosition: `${x}% ${y}%`,
        transform: transforms.length ? transforms.join(" ") : undefined,
        transformOrigin: `${x}% ${y}%`,
      }}
    />
  );
}
