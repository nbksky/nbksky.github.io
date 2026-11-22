import HeroBg from "./HeroBg";
import { useSettings } from "../../contexts/SettingsContext";
import { isDarkColor, isHexColor } from "../../theme";

// 사진 위에 덮는 테마 색(주색)의 진하기. 값이 없으면 예전과 같은 0.7.
const clampOverlay = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7);

export default function PageHero({ title, subtitle, image }) {
  const { appearance } = useSettings();
  const overlay = image ? clampOverlay(image.overlay) : 0.7;
  // 테마 색을 거의 덮지 않으면 밝은 사진 위에서도 글자가 읽히도록 그림자를 준다
  const readable = image && overlay < 0.5;

  // 글자색: 사진별 지정 > 테마의 서브 비주얼 색 > 자동(제목은 강조색, 부제목은 흰색). 값이 있을 때만 CSS 변수로 덮어쓴다.
  const titleColor = image && isHexColor(image.titleColor) ? image.titleColor : "";
  const subColor = image && isHexColor(image.subColor) ? image.subColor : "";
  const effTitle = titleColor || (isHexColor(appearance?.colors?.bannerTitle) ? appearance.colors.bannerTitle : appearance?.colors?.accent);
  const effSub = subColor || (isHexColor(appearance?.colors?.bannerSub) ? appearance.colors.bannerSub : "#ffffff");

  const style = {};
  if (image) style["--hero-overlay"] = overlay;
  if (titleColor) style["--page-hero-title"] = titleColor;
  if (subColor) style["--page-hero-sub"] = subColor;

  const classes = ["page-hero"];
  if (image) classes.push("page-hero--image");
  if (readable) classes.push("page-hero--clear");
  if (isDarkColor(effTitle)) classes.push("page-hero--title-dark");
  if (isDarkColor(effSub)) classes.push("page-hero--sub-dark");

  return (
    <section className={classes.join(" ")} style={Object.keys(style).length ? style : undefined}>
      {image && <HeroBg image={image} />}
      <div className="container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
