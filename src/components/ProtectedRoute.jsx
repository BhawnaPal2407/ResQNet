/**
 * ProtectedRoute.jsx
 * ------------------------------------------------------------------
 * Wraps any route that requires authentication.
 * Redirects to /login if the user is not logged in, preserving the
 * intended destination so we can redirect back after login.
 * ------------------------------------------------------------------
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
