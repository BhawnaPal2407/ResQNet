/**
 * Home.jsx
 * ---------------------------------------------------------------------
 * Logged-in dashboard — greets the user by name from AuthContext,
 * loads active emergency requests from the backend.
 * ---------------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Droplet, Users, Building2, Siren, HeartPulse, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import EmergencyCard from "../components/EmergencyCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getEmergencyRequests } from "../api/emergencies.js";

const QUICK_ACTIONS = [
  { icon: Droplet, label: "Find Blood",      to: "/blood-donors" },
  { icon: Droplet, label: "Request Blood",   to: "/blood-request" },
  { icon: Droplet, label: "Become a Donor",  to: "/donor-register" },
  { icon: Users,   label: "Volunteers",      to: "/volunteers" },
  { icon: Building2, label: "Live Map",      to: "/live-map" },
  { icon: Siren,   label: "Emergency",       to: "/emergency-request" },
];

export default function Home() {
  const { user } = useAuth();
  const userName = user?.name || "User";

  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);

  useEffect(() => {
    getEmergencyRequests()
      .then((data) => {
        // Support both array and { content: [...] } (Spring Page wrapper)
        const list = Array.isArray(data) ? data : data?.content ?? [];
        setRequests(list.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoadingReqs(false));
  }, []);

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-rq-muted text-sm">Good day,</p>
            <h1 className="text-2xl font-bold">{userName} 👋</h1>
            <p className="text-rq-muted text-sm mt-1">Ready to make a difference today?</p>
          </div>

          <Link
            to="/emergency-request"
            className="flex items-center gap-4 bg-gradient-to-r from-rq-red to-rq-redDark rounded-xl px-6 py-4 shadow-glow"
          >
            <Siren size={28} />
            <div className="text-left">
              <p className="font-bold">Request Emergency Help</p>
              <p className="text-xs text-white/80">Get immediate assistance for you or your loved ones.</p>
            </div>
            <ChevronRight />
          </Link>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-rq-muted mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="bg-rq-panel border border-rq-border rounded-xl p-5 flex flex-col items-center gap-2 hover:border-rq-red/60 transition-colors"
              >
                <a.icon className="text-rq-red" size={22} />
                <span className="text-sm">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Active emergency requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-rq-muted">Active Emergency Requests</h2>
            <Link to="/emergency-request" className="text-xs text-rq-red">View All</Link>
          </div>

          {loadingReqs ? (
            <p className="text-sm text-rq-muted">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-rq-muted">No active emergency requests right now.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {requests.map((req) => (
                <EmergencyCard
                  key={req.id}
                  bloodGroup={req.bloodGroup}
                  type={req.requestType || req.type}
                  hospital={req.hospitalName || req.hospital}
                  units={req.units ? `${req.units} Unit(s)` : "—"}
                  distance={req.distance || "—"}
                  urgent={req.urgent ?? true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Impact snapshot */}
        <div className="bg-rq-panel border border-rq-border rounded-xl p-8 flex items-center gap-4">
          <HeartPulse className="text-rq-red" size={36} />
          <p className="text-sm text-rq-muted">
            Every donation and volunteer effort brings us closer to saving more lives.
            Thank you for being part of the ResQNet community.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
