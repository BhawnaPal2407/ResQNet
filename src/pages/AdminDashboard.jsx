/**
 * AdminDashboard.jsx
 * ------------------------------------------------------------------
 * Admin control panel with 4 tabs:
 *   1. Blood Requests  — view all, match a donor, update/cancel status
 *   2. Emergency Requests — view all, update status, resolve, cancel
 *   3. Volunteers — view all, approve / reject
 *   4. Donors — view all registered donors
 * ------------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import {
  Droplet, Siren, Users, ShieldCheck,
  RefreshCw, CheckCircle2, XCircle, ChevronDown,
  Activity, UserCheck,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import {
  getAllBloodRequests, matchDonorToRequest, updateBloodReqStatus, cancelBloodReq,
  getAllEmergencyRequests, updateEmergencyReqStatus, resolveEmergencyReq, cancelEmergencyReq,
  getAllVolunteers, verifyVolunteer,
  getAllDonors,
} from "../api/admin.js";

/* ── Colour helpers ── */
const URGENCY_COLOR = {
  LOW:      "bg-green-500/15 text-green-400",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400",
  HIGH:     "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-rq-red/15 text-rq-red",
};
const STATUS_COLOR = {
  OPEN:                "bg-sky-500/15 text-sky-400",
  MATCHING:            "bg-yellow-500/15 text-yellow-400",
  DONOR_NOTIFIED:      "bg-orange-500/15 text-orange-400",
  DONOR_ACCEPTED:      "bg-blue-500/15 text-blue-400",
  DONATION_IN_PROGRESS:"bg-purple-500/15 text-purple-400",
  IN_PROGRESS:         "bg-purple-500/15 text-purple-400",
  ASSIGNED:            "bg-blue-500/15 text-blue-400",
  COMPLETED:           "bg-green-500/15 text-green-400",
  RESOLVED:            "bg-green-500/15 text-green-400",
  CANCELLED:           "bg-rq-muted/15 text-rq-muted",
  EXPIRED:             "bg-rq-muted/15 text-rq-muted",
};
const VERIFY_COLOR = {
  PENDING:  "bg-yellow-500/15 text-yellow-400",
  APPROVED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-rq-red/15 text-rq-red",
  SUSPENDED:"bg-rq-muted/15 text-rq-muted",
};

const BLOOD_STATUSES  = ["OPEN","MATCHING","DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED","CANCELLED"];
const EMERG_STATUSES  = ["OPEN","MATCHING","ASSIGNED","IN_PROGRESS","RESOLVED","CANCELLED","EXPIRED"];

const TABS = [
  { key: "blood",      label: "Blood Requests",     icon: Droplet },
  { key: "emergency",  label: "Emergency Requests",  icon: Siren },
  { key: "volunteers", label: "Volunteers",          icon: Users },
  { key: "donors",     label: "Donors",              icon: ShieldCheck },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("blood");

  /* ── Blood Requests state ── */
  const [bloodReqs,    setBloodReqs]    = useState([]);
  const [bloodLoading, setBloodLoading] = useState(false);
  const [donorIdInput, setDonorIdInput] = useState({}); // reqId → donorId string

  /* ── Emergency state ── */
  const [emergReqs,    setEmergReqs]    = useState([]);
  const [emergLoading, setEmergLoading] = useState(false);

  /* ── Volunteers state ── */
  const [volunteers,   setVolunteers]   = useState([]);
  const [volLoading,   setVolLoading]   = useState(false);

  /* ── Donors state ── */
  const [donors,       setDonors]       = useState([]);
  const [donorLoading, setDonorLoading] = useState(false);

  /* Stats */
  const stats = [
    { label: "Open Blood Requests",  value: bloodReqs.filter(r => r.status === "OPEN").length,  icon: Droplet,    color: "text-rq-red" },
    { label: "Open Emergencies",     value: emergReqs.filter(r => r.status === "OPEN").length,  icon: Siren,      color: "text-orange-400" },
    { label: "Pending Volunteers",   value: volunteers.filter(v => v.verificationStatus === "PENDING").length, icon: Users, color: "text-yellow-400" },
    { label: "Registered Donors",    value: donors.length,                                       icon: ShieldCheck,color: "text-green-400" },
  ];

  /* Load data per tab */
  useEffect(() => {
    if (tab === "blood" && bloodReqs.length === 0) loadBlood();
    if (tab === "emergency" && emergReqs.length === 0) loadEmerg();
    if (tab === "volunteers" && volunteers.length === 0) loadVol();
    if (tab === "donors" && donors.length === 0) loadDonors();
  }, [tab]); // eslint-disable-line

  // Also load stats on mount
  useEffect(() => {
    loadBlood(); loadEmerg(); loadVol(); loadDonors();
  }, []); // eslint-disable-line

  function loadBlood()  { setBloodLoading(true);  getAllBloodRequests().then(d => setBloodReqs(Array.isArray(d) ? d : d?.content ?? [])).catch(console.error).finally(() => setBloodLoading(false)); }
  function loadEmerg()  { setEmergLoading(true);  getAllEmergencyRequests().then(d => setEmergReqs(Array.isArray(d) ? d : d?.content ?? [])).catch(console.error).finally(() => setEmergLoading(false)); }
  function loadVol()    { setVolLoading(true);    getAllVolunteers().then(d => setVolunteers(Array.isArray(d) ? d : d?.content ?? [])).catch(console.error).finally(() => setVolLoading(false)); }
  function loadDonors() { setDonorLoading(true);  getAllDonors().then(d => setDonors(Array.isArray(d) ? d : d?.content ?? [])).catch(console.error).finally(() => setDonorLoading(false)); }

  /* ── Blood actions ── */
  const handleMatchDonor = async (reqId) => {
    const donorId = donorIdInput[reqId];
    if (!donorId) { alert("Enter a Donor ID first."); return; }
    try {
      const updated = await matchDonorToRequest(reqId, donorId);
      setBloodReqs(prev => prev.map(r => r.id === reqId ? updated : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to match donor."); }
  };

  const handleBloodStatus = async (reqId, status) => {
    try {
      const updated = await updateBloodReqStatus(reqId, status);
      setBloodReqs(prev => prev.map(r => r.id === reqId ? { ...r, status: updated.status || status } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to update status."); }
  };

  const handleCancelBlood = async (reqId) => {
    if (!confirm("Cancel this blood request?")) return;
    try {
      await cancelBloodReq(reqId);
      setBloodReqs(prev => prev.map(r => r.id === reqId ? { ...r, status: "CANCELLED" } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to cancel."); }
  };

  /* ── Emergency actions ── */
  const handleEmergStatus = async (id, status) => {
    try {
      const updated = await updateEmergencyReqStatus(id, status);
      setEmergReqs(prev => prev.map(r => r.id === id ? { ...r, status: updated.status || status } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  const handleResolve = async (id) => {
    try {
      await resolveEmergencyReq(id);
      setEmergReqs(prev => prev.map(r => r.id === id ? { ...r, status: "RESOLVED" } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to resolve."); }
  };

  const handleCancelEmerg = async (id) => {
    if (!confirm("Cancel this emergency request?")) return;
    try {
      await cancelEmergencyReq(id);
      setEmergReqs(prev => prev.map(r => r.id === id ? { ...r, status: "CANCELLED" } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to cancel."); }
  };

  /* ── Volunteer actions ── */
  const handleVerify = async (id, status) => {
    try {
      const updated = await verifyVolunteer(id, status);
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, verificationStatus: updated.verificationStatus || status } : v));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-rq-muted mt-1">Manage blood requests, emergencies, volunteers and donors.</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-rq-red/15 text-rq-red font-semibold uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-rq-panel border border-rq-border rounded-xl p-5 flex items-center gap-4">
              <s.icon className={s.color} size={28} />
              <div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-rq-muted leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-rq-border mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-rq-red text-rq-red"
                  : "border-transparent text-rq-muted hover:text-rq-text"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ════════════ TAB 1 — BLOOD REQUESTS ════════════ */}
        {tab === "blood" && (
          <Section
            title="Blood Requests"
            loading={bloodLoading}
            onRefresh={loadBlood}
            empty={bloodReqs.length === 0}
            emptyMsg="No blood requests found."
          >
            <div className="space-y-4">
              {bloodReqs.map((req) => (
                <div key={req.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rq-red/10 flex items-center justify-center">
                        <Droplet className="text-rq-red" size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-rq-red text-lg">{req.bloodGroup}</p>
                        <p className="text-xs text-rq-muted">#{req.id} · by {req.requesterName || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge text={req.urgency} color={URGENCY_COLOR[req.urgency]} />
                      <Badge text={req.status}  color={STATUS_COLOR[req.status]} />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-rq-muted">
                    <InfoCell label="Units"    value={req.units} />
                    <InfoCell label="Hospital" value={req.hospitalName || "—"} />
                    <InfoCell label="City"     value={req.city || "—"} />
                    <InfoCell label="Matched Donor" value={req.matchedDonorId ? `#${req.matchedDonorId}` : "None"} />
                  </div>

                  {/* Actions */}
                  {req.status !== "COMPLETED" && req.status !== "CANCELLED" && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-rq-border">
                      {/* Match donor */}
                      {!req.matchedDonorId && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={donorIdInput[req.id] || ""}
                            onChange={(e) => setDonorIdInput({ ...donorIdInput, [req.id]: e.target.value })}
                            placeholder="Donor ID"
                            className="bg-rq-bg border border-rq-border rounded-lg px-3 py-2 text-xs w-28 outline-none focus:border-rq-red"
                          />
                          <Button className="py-2 px-3 text-xs" onClick={() => handleMatchDonor(req.id)}>
                            Match Donor
                          </Button>
                        </div>
                      )}

                      {/* Status update */}
                      <StatusDropdown
                        current={req.status}
                        options={BLOOD_STATUSES}
                        onChange={(s) => handleBloodStatus(req.id, s)}
                      />

                      {/* Cancel */}
                      <button
                        onClick={() => handleCancelBlood(req.id)}
                        className="flex items-center gap-1 text-xs text-rq-muted hover:text-rq-red px-3 py-2 border border-rq-border rounded-lg hover:border-rq-red transition-colors"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ════════════ TAB 2 — EMERGENCY REQUESTS ════════════ */}
        {tab === "emergency" && (
          <Section
            title="Emergency Requests"
            loading={emergLoading}
            onRefresh={loadEmerg}
            empty={emergReqs.length === 0}
            emptyMsg="No emergency requests found."
          >
            <div className="space-y-4">
              {emergReqs.map((req) => (
                <div key={req.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Siren className="text-orange-400" size={22} />
                      </div>
                      <div>
                        <p className="font-bold">{req.category?.replace(/_/g, " ") || "Emergency"}</p>
                        <p className="text-xs text-rq-muted">#{req.id} · by {req.requesterName || "—"} · {req.city || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge text={req.urgency} color={URGENCY_COLOR[req.urgency]} />
                      <Badge text={req.status}  color={STATUS_COLOR[req.status]} />
                    </div>
                  </div>

                  {req.description && (
                    <p className="text-xs text-rq-muted bg-rq-bg rounded-lg px-4 py-2">{req.description}</p>
                  )}

                  {req.latitude && req.longitude && (
                    <p className="text-xs text-rq-muted">
                      📍 GPS: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                    </p>
                  )}

                  {req.status !== "RESOLVED" && req.status !== "CANCELLED" && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-rq-border">
                      <StatusDropdown
                        current={req.status}
                        options={EMERG_STATUSES}
                        onChange={(s) => handleEmergStatus(req.id, s)}
                      />
                      <Button
                        className="py-2 px-3 text-xs"
                        onClick={() => handleResolve(req.id)}
                      >
                        <CheckCircle2 size={13} /> Mark Resolved
                      </Button>
                      <button
                        onClick={() => handleCancelEmerg(req.id)}
                        className="flex items-center gap-1 text-xs text-rq-muted hover:text-rq-red px-3 py-2 border border-rq-border rounded-lg hover:border-rq-red transition-colors"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ════════════ TAB 3 — VOLUNTEERS ════════════ */}
        {tab === "volunteers" && (
          <Section
            title="Volunteers"
            loading={volLoading}
            onRefresh={loadVol}
            empty={volunteers.length === 0}
            emptyMsg="No volunteers registered yet."
          >
            <div className="grid md:grid-cols-2 gap-4">
              {volunteers.map((v) => (
                <div key={v.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-500/15 flex items-center justify-center font-bold text-blue-400">
                        {(v.contactName || v.organizationName || "V").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{v.contactName || v.organizationName || "—"}</p>
                        <p className="text-xs text-rq-muted">{v.organizationName || "—"}</p>
                      </div>
                    </div>
                    <Badge
                      text={v.verificationStatus || "PENDING"}
                      color={VERIFY_COLOR[v.verificationStatus || "PENDING"]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-rq-muted">
                    <InfoCell label="Services"    value={v.services    || "—"} />
                    <InfoCell label="Service Area" value={v.serviceArea || "—"} />
                    <InfoCell label="Phone"       value={v.contactPhone || "—"} />
                    <InfoCell label="Available"   value={v.available ? "Yes" : "No"} />
                  </div>

                  {(!v.verificationStatus || v.verificationStatus === "PENDING") && (
                    <div className="flex gap-2 pt-2 border-t border-rq-border">
                      <button
                        onClick={() => handleVerify(v.id, "APPROVED")}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors font-semibold"
                      >
                        <UserCheck size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(v.id, "REJECTED")}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-rq-red/15 text-rq-red hover:bg-rq-red/25 transition-colors font-semibold"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ════════════ TAB 4 — DONORS ════════════ */}
        {tab === "donors" && (
          <Section
            title="Registered Donors"
            loading={donorLoading}
            onRefresh={loadDonors}
            empty={donors.length === 0}
            emptyMsg="No donors registered yet."
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((d) => (
                <div key={d.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rq-red/15 flex items-center justify-center font-bold text-rq-red text-lg flex-shrink-0">
                    {(d.donorName || d.name || "D").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{d.donorName || d.name || "—"}</p>
                    <p className="text-xs text-rq-muted">{d.city || "—"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-rq-red">{d.bloodGroup}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        d.available ? "bg-green-500/15 text-green-400" : "bg-rq-muted/15 text-rq-muted"
                      }`}>
                        {d.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      <Footer />
    </div>
  );
}

/* ── Helper sub-components ── */

function Section({ title, loading, onRefresh, empty, emptyMsg, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-lg">{title}</h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs text-rq-muted hover:text-rq-red transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-rq-muted">Loading…</p>
      ) : empty ? (
        <p className="text-sm text-rq-muted">{emptyMsg}</p>
      ) : children}
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide ${color || "bg-rq-muted/15 text-rq-muted"}`}>
      {text?.replace(/_/g, " ") || "—"}
    </span>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-rq-muted uppercase tracking-wide">{label}</p>
      <p className="font-medium text-rq-text text-xs truncate">{value}</p>
    </div>
  );
}

function StatusDropdown({ current, options, onChange }) {
  const [selected, setSelected] = useState(current);

  return (
    <div className="flex items-center gap-1.5">
      <Activity size={13} className="text-rq-muted" />
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="bg-rq-bg border border-rq-border rounded-lg px-3 py-2 text-xs outline-none focus:border-rq-red"
      >
        {options.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
      <button
        onClick={() => onChange(selected)}
        disabled={selected === current}
        className="text-xs px-2 py-2 rounded-lg bg-rq-red/15 text-rq-red hover:bg-rq-red/25 disabled:opacity-40 transition-colors font-semibold"
      >
        Apply
      </button>
    </div>
  );
}
