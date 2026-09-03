/**
 * Navbar.jsx
 * ---------------------------------------------------------------------
 * Top navigation. Reads auth state from AuthContext — no need to pass
 * loggedIn / userName as props anymore (they still work as fallbacks).
 * ---------------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell, LogOut } from "lucide-react";
import Button from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import resqnetLogo from "../assets/logo/ResQNet Logo.png";

const NAV_LINKS = [
  { label: "Home",          to: "/" },
  { label: "Blood Donation",to: "/blood-donors" },
  { label: "Emergencies",   to: "/emergency-request" },
  { label: "Volunteers",    to: "/volunteers" },
  { label: "About Us",      to: "/about" },
  { label: "Contact",       to: "/contact" },
];

export default function Navbar({ loggedIn: loggedInProp, userName: userNameProp }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  // Context takes precedence over props
  const isAuthenticated = isLoggedIn || loggedInProp;
  const displayName = user?.name || userNameProp || "User";

  // Load locally saved name + avatar
  const [localAvatar, setLocalAvatar] = useState(null);
  useEffect(() => {
    if (!user?.userId) return;
    try {
      const lp = JSON.parse(localStorage.getItem(`rq_profile_${user.userId}`)) || {};
      if (lp.avatar) setLocalAvatar(lp.avatar);
      if (lp.name)   {} // name handled by auth context
    } catch {}
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-black backdrop-blur border-b border-rq-border">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2">
          <img
            src={resqnetLogo}
            alt="ResQNet logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-white">
          {NAV_LINKS.map((link) => {
            const to = link.label === "Home" && isAuthenticated ? "/home" : link.to;
            return (
              <li key={link.label}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `hover:text-rq-red transition-colors ${isActive ? "text-rq-red" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-xs px-3 py-1.5 rounded-lg bg-rq-red/15 text-rq-red hover:bg-rq-red/25 font-semibold transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/my-requests"
                className="text-xs px-3 py-1.5 rounded-lg border border-rq-border text-rq-muted hover:border-rq-red hover:text-rq-red transition-colors"
              >
                My Requests
              </Link>
              <button className="relative p-2 text-rq-muted hover:text-rq-red">
                <Bell size={20} />
              </button>
              <Link to="/profile" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-rq-panel border border-rq-border overflow-hidden flex items-center justify-center text-sm font-semibold">
                  {localAvatar
                    ? <img src={localAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : displayName.charAt(0).toUpperCase()
                  }
                </div>
                <span className="text-sm">{displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-rq-muted hover:text-rq-red"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Button as="link" to="/login" variant="outline" className="px-5 py-2">
                Login
              </Button>
              <Button as="link" to="/signup" className="px-5 py-2">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-rq-text" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-rq-border bg-rq-bg px-6 py-4 space-y-4">
          {NAV_LINKS.map((link) => {
            const to = link.label === "Home" && isAuthenticated ? "/home" : link.to;
            return (
              <Link
                key={link.label}
                to={to}
                onClick={() => setOpen(false)}
                className="block text-rq-muted hover:text-rq-red"
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex gap-3 pt-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex-1 border border-rq-border rounded-lg py-3 text-sm hover:border-rq-red flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <>
                <Button as="link" to="/login" variant="outline" className="flex-1">
                  Login
                </Button>
                <Button as="link" to="/signup" className="flex-1">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
