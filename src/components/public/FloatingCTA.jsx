import { Link } from "react-router-dom";
import "./FloatingCTA.css";

export default function FloatingCTA() {
  return (
    <Link to="/consultation" className="floating-cta">
      <span className="floating-cta__bubble">💬</span>
      <span className="floating-cta__text">
        상담문의
        <br />
        바로가기
      </span>
    </Link>
  );
}
