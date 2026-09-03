/**
 * AuthContext.jsx
 * ------------------------------------------------------------------
 * Global auth state — stores token + user info in localStorage so
 * the session survives a page refresh.
 *
 * Provides:
 *   user       — { userId, name, email, role } | null
 *   token      — JWT string | null
 *   login(data)  — called after successful login/register
 *   logout()   — clears state + storage
 *   isLoggedIn — boolean convenience flag
 * ------------------------------------------------------------------
 */
import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("rq_token"));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("rq_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /** Call this with the object returned by /api/auth/login or /register */
  const login = useCallback((authData) => {
    const { token: newToken, userId, name, email, role } = authData;
    const userData = { userId, name, email, role };
    localStorage.setItem("rq_token", newToken);
    localStorage.setItem("rq_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rq_token");
    localStorage.removeItem("rq_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isLoggedIn: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook for consuming auth state in any component */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
