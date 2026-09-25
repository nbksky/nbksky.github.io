import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ settings }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <div className="site-footer__logo">{settings.officeName}</div>
          <p>
            전화번호 : {settings.phone} | 주소 : {settings.address}
          </p>
        </div>
        <div className="site-footer__links">
          <Link to="/admin/login">관리자</Link>
        </div>
      </div>
    </footer>
  );
}
