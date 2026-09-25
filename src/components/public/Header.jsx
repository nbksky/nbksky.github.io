import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Header.css";

export default function Header({ officeName }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" onClick={() => setOpen(false)}>
          {officeName}
        </Link>

        <nav className={`site-header__nav ${open ? "is-open" : ""}`}>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            사무소 소개
          </NavLink>
          <NavLink to="/location" onClick={() => setOpen(false)}>
            오시는 길
          </NavLink>
          <NavLink to="/services" onClick={() => setOpen(false)}>
            업무 분야
          </NavLink>
          <NavLink to="/notices" onClick={() => setOpen(false)}>
            공지사항
          </NavLink>
          <NavLink to="/consultation" onClick={() => setOpen(false)}>
            상담신청
          </NavLink>
        </nav>

        <button
          type="button"
          className="site-header__toggle"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
