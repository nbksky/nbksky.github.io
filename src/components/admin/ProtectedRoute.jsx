import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="state-msg">확인 중...</p>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
