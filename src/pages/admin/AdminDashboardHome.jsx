/**
 * AdminDashboardHome.jsx  —  /admin
 * Stats overview with live numbers from GET /api/admin/dashboard
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Droplet, HeartPulse, Siren,
  UserCheck, Building2, AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import { PageHeader, LoadingState } from "../../components/admin/AdminShared.jsx";
import { getDashboardStats } from "../../api/adminApi.js";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cards = stats ? [
    { label: "Total Users",             value: stats.totalUsers,             icon: Users,       color: "text-blue-400",   to: "/admin/users" },
    { label: "Blood Donors",            value: stats.totalBloodDonors,       icon: Droplet,     color: "text-rq-red",     to: "/admin/blood-donors" },
    { label: "Available Donors",        value: stats.availableBloodDonors,   icon: Droplet,     color: "text-green-400",  to: "/admin/blood-donors" },
    { label: "Total Blood Requests",    value: stats.totalBloodRequests,     icon: HeartPulse,  color: "text-orange-400", to: "/admin/blood-requests" },
    { label: "Open Blood Requests",     value: stats.openBloodRequests,      icon: HeartPulse,  color: "text-rq-red",     to: "/admin/blood-requests" },
    { label: "Open Emergencies",        value: stats.openEmergencyRequests,  icon: Siren,       color: "text-orange-400", to: "/admin/emergency-requests" },
    { label: "Pending Volunteers",      value: stats.pendingVolunteers,      icon: UserCheck,   color: "text-yellow-400", to: "/admin/volunteers" },
    { label: "Pending NGOs",            value: stats.pendingNGOs,            icon: Building2,   color: "text-yellow-400", to: "/admin/ngos" },
    { label: "Volunteers",              value: stats.totalVolunteers,        icon: UserCheck,   color: "text-blue-400",   to: "/admin/volunteers" },
    { label: "NGOs",                    value: stats.totalNGOs,              icon: Building2,   color: "text-purple-400", to: "/admin/ngos" },
    { label: "Completed Blood Requests",value: stats.completedBloodRequests, icon: HeartPulse,  color: "text-green-400",  to: "/admin/blood-requests" },
    { label: "Resolved Emergencies",    value: stats.resolvedEmergencyRequests, icon: Siren,   color: "text-green-400",  to: "/admin/emergency-requests" },
  ] : [];

  return (
    <AdminLayout stats={stats}>
      <div className="p-8">
        <PageHeader
          title="Dashboard"
          subtitle="Platform-wide overview"
          onRefresh={load}
          loading={loading}
        />

        {/* Alerts for pending items */}
        {stats && (stats.pendingVolunteers > 0 || stats.pendingNGOs > 0) && (
          <div className="mb-6 flex gap-3 flex-wrap">
            {stats.pendingVolunteers > 0 && (
              <Link to="/admin/volunteers"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors">
                <AlertTriangle size={15} />
                {stats.pendingVolunteers} volunteer{stats.pendingVolunteers > 1 ? "s" : ""} pending approval
              </Link>
            )}
            {stats.pendingNGOs > 0 && (
              <Link to="/admin/ngos"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors">
                <AlertTriangle size={15} />
                {stats.pendingNGOs} NGO{stats.pendingNGOs > 1 ? "s" : ""} pending approval
              </Link>
            )}
          </div>
        )}

        {loading ? <LoadingState /> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Link key={c.label} to={c.to}
                className="bg-rq-panel border border-rq-border rounded-xl p-5 hover:border-rq-red/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <c.icon className={c.color} size={22} />
                </div>
                <p className="text-3xl font-black mb-1">{c.value ?? "—"}</p>
                <p className="text-xs text-rq-muted">{c.label}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
