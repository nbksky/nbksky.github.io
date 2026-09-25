import "./MapLink.css";

// 관리자가 등록한 지도 사진(선택)과 네이버 지도 링크로 구성된 지도 카드. http(s) 링크만 허용한다.
export default function MapLink({ url, address, image, height = 320 }) {
  const safeUrl = /^https?:\/\//i.test(url || "") ? url : "";

  if (image) {
    const body = (
      <>
        <img className="map-link__img" src={image} alt={address ? `${address} 지도` : "지도"} />
        {safeUrl && <span className="map-link__cta map-link__cta--overlay">네이버 지도에서 보기 →</span>}
      </>
    );
    return safeUrl ? (
      <a className="map-link map-link--image" href={safeUrl} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    ) : (
      <div className="map-link map-link--image">{body}</div>
    );
  }

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
