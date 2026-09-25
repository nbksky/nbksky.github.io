import "./MapLink.css";

// 관리자가 등록한 네이버 지도 링크로 연결되는 지도 카드. http(s) 링크만 허용한다.
export default function MapLink({ url, address, height = 320 }) {
  const safeUrl = /^https?:\/\//i.test(url || "") ? url : "";

  if (!safeUrl) {
    return (
      <div className="map-link map-link--empty" style={{ minHeight: height }}>
        지도 링크가 아직 등록되지 않았습니다
      </div>
    );
  }

  return (
    <a
      className="map-link"
      style={{ minHeight: height }}
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="map-link__pin" aria-hidden="true">
        📍
      </span>
      <span className="map-link__address">{address}</span>
      <span className="map-link__cta">네이버 지도에서 보기 →</span>
    </a>
  );
}
