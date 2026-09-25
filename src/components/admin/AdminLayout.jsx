import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/admin", label: "대시보드", end: true },
  { to: "/admin/consultations", label: "상담신청 접수" },
  { to: "/admin/notices", label: "공지사항 관리" },
  { to: "/admin/services", label: "업무분야 관리" },
  { to: "/admin/settings", label: "메인페이지 설정" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">관리자</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <p>{user?.email}</p>
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
