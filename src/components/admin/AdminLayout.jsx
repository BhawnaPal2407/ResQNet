/**
 * AdminLayout.jsx
 * Persistent sidebar + top bar for all admin pages.
 */
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Droplet, HeartPulse,
  Siren, UserCheck, Building2, LogOut, ChevronRight,
  Home, Phone, ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import resqnetLogo from "../../assets/logo/ResQNet Logo.png";

const NAV = [
  { to: "/admin",                    icon: LayoutDashboard, label: "Dashboard",          exact: true },
  { to: "/admin/users",              icon: Users,           label: "Users" },
  { to: "/admin/blood-donors",       icon: Droplet,         label: "Blood Donors" },
  { to: "/admin/blood-requests",     icon: HeartPulse,      label: "Blood Requests" },
  { to: "/admin/emergency-requests", icon: Siren,           label: "Emergencies" },
  { to: "/admin/volunteers",         icon: UserCheck,       label: "Volunteers" },
  { to: "/admin/ngos",               icon: Building2,       label: "NGOs" },
];

const SITE_LINKS = [
  { to: "/home",    icon: Home,  label: "Home" },
  { to: "/contact", icon: Phone, label: "Contact" },
];

export default function AdminLayout({ children, stats }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const pendingBadge = (count) =>
    count > 0 ? (
      <span className="ml-auto text-[10px] bg-rq-red text-white rounded-full px-1.5 py-0.5 font-bold">
        {count}
      </span>
    ) : null;

  return (
    <div className="min-h-screen bg-rq-bg text-rq-text flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-rq-panel border-r border-rq-border flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-rq-border">
          <img src={resqnetLogo} alt="ResQNet" className="h-9 w-auto object-contain" />
          <p className="text-[10px] text-rq-red font-semibold mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-rq-red/15 text-rq-red font-semibold"
                    : "text-rq-muted hover:bg-rq-bg hover:text-rq-text"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
              {item.label === "Volunteers" && pendingBadge(stats?.pendingVolunteers)}
              {item.label === "NGOs"       && pendingBadge(stats?.pendingNGOs)}
            </NavLink>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-rq-border" />

          {/* Back to site links */}
          <p className="text-[10px] text-rq-muted uppercase tracking-widest px-4 mb-1">Back to Site</p>
          {SITE_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rq-muted hover:bg-rq-bg hover:text-rq-text transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-rq-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-rq-red/15 flex items-center justify-center text-rq-red font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-rq-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-xs text-rq-muted hover:text-rq-red transition-colors py-2"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
