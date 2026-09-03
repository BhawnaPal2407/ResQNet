/**
 * MyRequests.jsx   /my-requests
 * ─────────────────────────────────────────────────────────────────
 * Shows all of the logged-in user's requests in one place:
 *  - Blood Requests  (GET /api/blood-requests/me)
 *  - Emergency Requests (GET /api/emergency-requests/me)
 *
 * Each card has a "Track" button linking to the appropriate
 * tracking page.
 * ─────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Droplet, Siren, ArrowRight, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { getMyBloodRequests, getMyEmergencyRequests } from "../api/emergencies.js";

const URGENCY_COLOR = {
  LOW:      "text-green-400 bg-green-500/15",
  MEDIUM:   "text-yellow-400 bg-yellow-500/15",
  HIGH:     "text-orange-400 bg-orange-500/15",
  CRITICAL: "text-rq-red bg-rq-red/15",
};

const STATUS_COLOR = {
  OPEN:                "text-sky-400 bg-sky-500/15",
  MATCHING:            "text-yellow-400 bg-yellow-500/15",
  DONOR_NOTIFIED:      "text-orange-400 bg-orange-500/15",
  DONOR_ACCEPTED:      "text-blue-400 bg-blue-500/15",
  DONATION_IN_PROGRESS:"text-purple-400 bg-purple-500/15",
  IN_PROGRESS:         "text-purple-400 bg-purple-500/15",
  ASSIGNED:            "text-blue-400 bg-blue-500/15",
  COMPLETED:           "text-green-400 bg-green-500/15",
  RESOLVED:            "text-green-400 bg-green-500/15",
  CANCELLED:           "text-rq-muted bg-rq-muted/15",
  EXPIRED:             "text-rq-muted bg-rq-muted/15",
};

const CAT_ICON = {
  ROAD_ACCIDENT:"🚗", FIRE:"🔥", MEDICAL_EMERGENCY:"🏥",
  NATURAL_DISASTER:"🌊", MISSING_PERSON:"🔍", RESCUE:"🛟", OTHER:"⚡",
};

export default function MyRequests() {
  const [bloodReqs,  setBloodReqs]  = useState([]);
  const [emergReqs,  setEmergReqs]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("all");

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getMyBloodRequests(),
      getMyEmergencyRequests(),
    ]).then(([b, e]) => {
      if (b.status === "fulfilled") {
        const list = Array.isArray(b.value) ? b.value : b.value?.content ?? [];
        setBloodReqs(list);
      }
      if (e.status === "fulfilled") {
        const list = Array.isArray(e.value) ? e.value : e.value?.content ?? [];
        setEmergReqs(list);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const allRequests = [
    ...bloodReqs.map(r => ({ ...r, _type: "blood" })),
    ...emergReqs.map(r => ({ ...r, _type: "emergency" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const visible = tab === "all"       ? allRequests
    : tab === "blood"                  ? allRequests.filter(r => r._type === "blood")
    : tab === "emergency"              ? allRequests.filter(r => r._type === "emergency")
    : allRequests.filter(r => !["COMPLETED","RESOLVED","CANCELLED","EXPIRED"].includes(r.status));

  const activeCount = allRequests.filter(r =>
    !["COMPLETED","RESOLVED","CANCELLED","EXPIRED"].includes(r.status)
  ).length;

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold">My Requests</h1>
            <p className="text-sm text-rq-muted mt-0.5">
              {allRequests.length} total · {activeCount} active
            </p>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-rq-muted hover:text-rq-red transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Quick links to raise new requests */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link to="/blood-request"
            className="flex items-center gap-3 bg-rq-panel border border-rq-border rounded-xl p-4 hover:border-rq-red/60 transition-colors group">
            <Droplet className="text-rq-red" size={20} />
            <div>
              <p className="text-sm font-semibold">New Blood Request</p>
              <p className="text-xs text-rq-muted">Request blood from donors</p>
            </div>
            <ArrowRight className="ml-auto text-rq-muted group-hover:text-rq-red" size={16} />
          </Link>
          <Link to="/emergency-request"
            className="flex items-center gap-3 bg-rq-panel border border-rq-border rounded-xl p-4 hover:border-rq-red/60 transition-colors group">
            <Siren className="text-orange-400" size={20} />
            <div>
              <p className="text-sm font-semibold">New Emergency Request</p>
              <p className="text-xs text-rq-muted">Raise an emergency alert</p>
            </div>
            <ArrowRight className="ml-auto text-rq-muted group-hover:text-rq-red" size={16} />
          </Link>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 mb-6 border-b border-rq-border pb-1">
          {[
            { key: "all",       label: `All (${allRequests.length})` },
            { key: "active",    label: `Active (${activeCount})` },
            { key: "blood",     label: `Blood (${bloodReqs.length})` },
            { key: "emergency", label: `Emergency (${emergReqs.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`text-sm px-4 py-2 border-b-2 -mb-px font-semibold transition-colors ${
                tab === t.key ? "border-rq-red text-rq-red" : "border-transparent text-rq-muted hover:text-rq-text"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading && <p className="text-sm text-rq-muted py-8 text-center">Loading your requests…</p>}

        {!loading && visible.length === 0 && (
          <div className="text-center py-16">
            <p className="text-rq-muted text-sm mb-4">No requests found.</p>
            <Button as="link" to="/blood-request" icon={Droplet}>Request Blood</Button>
          </div>
        )}

        <div className="space-y-4">
          {visible.map(req => (
            <div key={`${req._type}-${req.id}`}
              className="bg-rq-panel border border-rq-border rounded-xl p-5 hover:border-rq-red/40 transition-colors">

              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Icon + title */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    req._type === "blood" ? "bg-rq-red/10 text-2xl" : "bg-orange-500/10 text-2xl"
                  }`}>
                    {req._type === "blood"
                      ? <Droplet className="text-rq-red" size={22} />
                      : <span>{CAT_ICON[req.category] || "⚡"}</span>
                    }
                  </div>
                  <div>
                    <p className="font-bold">
                      {req._type === "blood"
                        ? `${req.bloodGroup} Blood · ${req.units} unit(s)`
                        : req.category?.replace(/_/g," ") || "Emergency"}
                    </p>
                    <p className="text-xs text-rq-muted">
                      {req._type === "blood"
                        ? `${req.hospitalName || "—"} · ${req.city || "—"}`
                        : req.city || "—"}
                    </p>
                    <p className="text-xs text-rq-muted mt-0.5">
                      #{req.id} · {req.createdAt?.slice(0,10) || "—"}
                    </p>
                  </div>
                </div>

                {/* Badges + Track button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLOR[req.urgency] || "text-rq-muted bg-rq-muted/15"}`}>
                    {req.urgency}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[req.status] || "text-rq-muted bg-rq-muted/15"}`}>
                    {req.status?.replace(/_/g," ")}
                  </span>
                  <Link
                    to={req._type === "blood"
                      ? `/tracking/blood/${req.id}`
                      : `/tracking/emergency/${req.id}`}
                    className="flex items-center gap-1.5 text-xs bg-rq-red text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Track <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <ProgressBar type={req._type} status={req.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* Mini progress bar showing how far along a request is */
function ProgressBar({ type, status }) {
  const bloodOrder = ["OPEN","MATCHING","DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED"];
  const emergOrder = ["OPEN","MATCHING","ASSIGNED","IN_PROGRESS","RESOLVED"];

  const order = type === "blood" ? bloodOrder : emergOrder;
  const idx   = order.indexOf(status);
  const pct   = idx < 0 ? 0 : Math.round(((idx + 1) / order.length) * 100);
  const done  = ["COMPLETED","RESOLVED"].includes(status);
  const cancelled = ["CANCELLED","EXPIRED"].includes(status);

  if (cancelled) return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-rq-border rounded-full" />
      <span className="text-[10px] text-rq-muted">{status}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-rq-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? "bg-green-500" : "bg-rq-red"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-rq-muted w-8 text-right">{pct}%</span>
    </div>
  );
}
