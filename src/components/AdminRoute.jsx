/**
 * AdminRoute.jsx
 * ------------------------------------------------------------------
 * Protects admin-only routes.
 * - Not logged in  → /login
 * - Logged in but not ADMIN → /home with an "Access Denied" message
 * ------------------------------------------------------------------
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== "ADMIN") {
    return <Navigate to="/home" state={{ denied: true }} replace />;
  }
  return children;
}
