/**
 * EmergencyRequest.jsx
 * ---------------------------------------------------------------------
 * Two distinct flows based on category:
 *
 * MEDICAL flow  (MEDICAL_EMERGENCY)
 *   → For anyone who needs medical help / blood
 *   → POST /api/emergency-requests
 *
 * FIELD flow  (ROAD_ACCIDENT, FIRE, NATURAL_DISASTER, RESCUE, etc.)
 *   → For situations requiring on-ground volunteers
 *   → POST /api/emergency-requests
 *   → Only available to logged-in users (volunteers get notified)
 *
 * Both flows use the same backend DTO:
 *   category  (required enum)
 *   city      (required)
 *   urgency   (required enum)
 *   description (optional)
 *   latitude, longitude (optional GPS)
 * ---------------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Stethoscope, AlertTriangle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import EmergencyCard from "../components/EmergencyCard.jsx";
import { createEmergencyRequest, getEmergencyRequests } from "../api/emergencies.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ── Category groups ─────────────────────────────── */
const MEDICAL_CATEGORY = { value: "MEDICAL_EMERGENCY", label: "Medical Emergency" };

const FIELD_CATEGORIES = [
  { value: "ROAD_ACCIDENT",   label: "Road Accident",   icon: "🚗" },
  { value: "FIRE",            label: "Fire",            icon: "🔥" },
  { value: "NATURAL_DISASTER",label: "Natural Disaster",icon: "🌊" },
  { value: "MISSING_PERSON",  label: "Missing Person",  icon: "🔍" },
  { value: "RESCUE",          label: "Rescue",          icon: "🛟" },
  { value: "OTHER",           label: "Other",           icon: "⚡" },
];

const URGENCY_LEVELS = [
  { value: "LOW",      label: "Low",      color: "border-green-500  bg-green-500/10  text-green-400" },
  { value: "MEDIUM",   label: "Medium",   color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { value: "HIGH",     label: "High",     color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { value: "CRITICAL", label: "Critical", color: "border-rq-red     bg-rq-red/10     text-rq-red" },
];

/* ── Shared form component ─────────────────────────── */
function RequestForm({ category, onSuccess }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ city: "", urgency: "HIGH", description: "" });
  const [useGPS, setUseGPS]     = useState(false);
  const [coords, setCoords]     = useState({ latitude: null, longitude: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [debugInfo, setDebugInfo] = useState(null); // temporary debug

  useEffect(() => {
    if (useGPS && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => setCoords({ latitude: null, longitude: null })
      );
    } else {
      setCoords({ latitude: null, longitude: null });
    }
  }, [useGPS]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate("/login"); return; }
    setError("");
    setDebugInfo(null);
    setSubmitting(true);
    try {
      const payload = {
        category,
        city:    form.city,
        urgency: form.urgency,
        ...(form.description          && { description: form.description }),
        ...(useGPS && coords.latitude  && { latitude:   coords.latitude }),
        ...(useGPS && coords.longitude && { longitude:  coords.longitude }),
      };
      const created = await createEmergencyRequest(payload);
      if (onSuccess) onSuccess(created);
    } catch (err) {
      const status = err.response?.status;
      const d      = err.response?.data;

      // Show raw debug info on screen so we can see exact backend response
      setDebugInfo({ status, data: d, payload: {
        category, city: form.city, urgency: form.urgency
      }});

      let msg = "Failed to submit. Please try again.";
      if (!err.response)                    msg = "Cannot reach the server.";
      else if (typeof d === "string" && d.length < 400) msg = d;
      else if (d?.message)                  msg = d.message;
      else if (d?.error)                    msg = d.error;
      else if (d?.errors)                   msg = Object.values(d.errors).join(", ");
      else if (status === 403)              msg = "Not authorised. Please log in again.";
      else if (status === 400)              msg = "Invalid request data. Check all fields.";
      else if (status === 500)              msg = "Server error. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
          {error}
        </div>
      )}

      {/* DEBUG PANEL — remove after fixing */}
      {debugInfo && (
        <div className="px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-xs text-yellow-300 font-mono break-all space-y-1">
          <p className="font-bold text-yellow-400">Debug — HTTP {debugInfo.status}</p>
          <p><span className="text-yellow-500">Sent:</span> {JSON.stringify(debugInfo.payload)}</p>
          <p><span className="text-yellow-500">Response:</span> {JSON.stringify(debugInfo.data)}</p>
        </div>
      )}

      {/* Urgency */}
      <div>
        <label className="text-xs text-rq-muted mb-2 block">Urgency Level</label>
        <div className="grid grid-cols-4 gap-2">
          {URGENCY_LEVELS.map((u) => (
            <button
              type="button"
              key={u.value}
              onClick={() => setForm({ ...form, urgency: u.value })}
              className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                form.urgency === u.value
                  ? u.color
                  : "border-rq-border text-rq-muted hover:border-rq-red/50"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="text-xs text-rq-muted mb-1 block">City <span className="text-rq-red">*</span></label>
        <div className="flex items-center gap-2 bg-rq-bg border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
          <MapPin size={16} className="text-rq-muted" />
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Delhi"
            required
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-rq-muted mb-1 block">Description (Optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Describe the situation in detail…"
          className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-3 text-sm focus:border-rq-red outline-none resize-none"
        />
      </div>

      {/* GPS */}
      <label className="flex items-center gap-3 text-sm text-rq-muted cursor-pointer">
        <input
          type="checkbox"
          checked={useGPS}
          onChange={(e) => setUseGPS(e.target.checked)}
          className="accent-rq-red"
        />
        <Navigation size={14} className="text-rq-red" />
        Share my GPS location with responders
        {useGPS && coords.latitude && (
          <span className="text-xs text-green-400">
            ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)})
          </span>
        )}
      </label>

      {!isLoggedIn && (
        <p className="text-xs text-rq-muted bg-rq-panel border border-rq-border rounded-lg px-4 py-3">
          You need to be <a href="/login" className="text-rq-red">logged in</a> to submit a request.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={submitting || !isLoggedIn}>
        {submitting ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}

/* ── Main page ────────────────────────────────────── */
export default function EmergencyRequest() {
  const navigate = useNavigate();
  const [tab, setTab]     = useState("medical"); // "medical" | "field"
  const [fieldCat, setFieldCat] = useState("ROAD_ACCIDENT");
  const [submitted, setSubmitted] = useState(null); // created request obj

  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    getEmergencyRequests()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.content ?? [];
        setActiveRequests(list.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  if (submitted) {
    return (
      <div className="bg-rq-bg text-rq-text min-h-screen">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-green-400" size={36} />
          </div>
          <h1 className="text-xl font-bold mb-2">Request Submitted!</h1>
          <p className="text-sm text-rq-muted mb-8">
            Your emergency request has been raised. Nearby responders have been notified.
          </p>
          <div className="flex gap-3 justify-center">
            {submitted?.id && (
              <Button onClick={() => navigate(`/tracking/emergency/${submitted.id}`)}>
                Track Request
              </Button>
            )}
            <Button variant="outline" onClick={() => setSubmitted(null)}>
              Raise Another
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">

        {/* ── Left: forms ── */}
        <div className="lg:col-span-2">
          <h1 className="text-xl font-bold mb-1">Emergency Request</h1>
          <p className="text-sm text-rq-muted mb-6">
            Choose the type of emergency and fill in the details.
          </p>

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setTab("medical")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                tab === "medical"
                  ? "border-rq-red bg-rq-red/10"
                  : "border-rq-border bg-rq-panel hover:border-rq-red/50"
              }`}
            >
              <Stethoscope className="text-rq-red" size={22} />
              <div className="text-left">
                <p className="font-semibold text-sm">Medical Emergency</p>
                <p className="text-[11px] text-rq-muted">Blood, ambulance, hospital</p>
              </div>
            </button>
            <button
              onClick={() => setTab("field")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                tab === "field"
                  ? "border-rq-red bg-rq-red/10"
                  : "border-rq-border bg-rq-panel hover:border-rq-red/50"
              }`}
            >
              <AlertTriangle className="text-rq-red" size={22} />
              <div className="text-left">
                <p className="font-semibold text-sm">Field Emergency</p>
                <p className="text-[11px] text-rq-muted">Road accident, fire, rescue</p>
              </div>
            </button>
          </div>

          {/* ── Medical form ── */}
          {tab === "medical" && (
            <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Stethoscope className="text-rq-red" size={18} />
                <h2 className="font-semibold">Medical Emergency</h2>
              </div>
              <p className="text-xs text-rq-muted mb-5">
                For blood requests, ambulance needs, and hospital-related emergencies.
                Use the description to mention blood group, units needed, hospital name, etc.
              </p>
              <RequestForm
                category={MEDICAL_CATEGORY.value}
                onSuccess={setSubmitted}
              />
            </div>
          )}

          {/* ── Field emergency form ── */}
          {tab === "field" && (
            <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="text-rq-red" size={18} />
                <h2 className="font-semibold">Field Emergency — Volunteer Response</h2>
              </div>
              <p className="text-xs text-rq-muted mb-5">
                These emergencies are routed to nearby volunteers on the ground.
                Select the type of emergency:
              </p>

              {/* Category picker */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {FIELD_CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setFieldCat(c.value)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      fieldCat === c.value
                        ? "border-rq-red bg-rq-red/10"
                        : "border-rq-border bg-rq-bg hover:border-rq-red/50"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{c.icon}</span>
                    <p className="text-xs font-semibold">{c.label}</p>
                  </button>
                ))}
              </div>

              <RequestForm
                category={fieldCat}
                onSuccess={setSubmitted}
              />
            </div>
          )}
        </div>

        {/* ── Right: active requests sidebar ── */}
        <div>
          <h2 className="text-sm font-semibold text-rq-muted mb-4">Active Requests</h2>
          {activeRequests.length === 0 ? (
            <p className="text-sm text-rq-muted">No active requests right now.</p>
          ) : (
            <div className="space-y-4">
              {activeRequests.map((req) => (
                <EmergencyCard
                  key={req.id}
                  bloodGroup={req.category?.replace(/_/g, " ") || "—"}
                  type=""
                  hospital={req.city || "—"}
                  units={req.urgency || "—"}
                  distance="—"
                  urgent={req.urgency === "HIGH" || req.urgency === "CRITICAL"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
