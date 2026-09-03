/**
 * TrackBloodRequest.jsx   /tracking/blood/:id
 * ─────────────────────────────────────────────────────────────────
 * Live tracking for a blood request.
 * Polls GET /api/blood-requests/:id every 10 seconds.
 *
 * Status flow:
 *  OPEN → MATCHING → DONOR_NOTIFIED → DONOR_ACCEPTED
 *       → DONATION_IN_PROGRESS → COMPLETED
 * ─────────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, Phone, Droplet, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { getBloodRequestById } from "../api/emergencies.js";

const STEPS = [
  { key: "OPEN",                label: "Request Created",        desc: "Your blood request is live." },
  { key: "MATCHING",            label: "Finding Donors",         desc: "Searching for compatible donors nearby." },
  { key: "DONOR_NOTIFIED",      label: "Donor Notified",         desc: "A donor has been notified of your request." },
  { key: "DONOR_ACCEPTED",      label: "Donor Accepted",         desc: "A donor has agreed to help." },
  { key: "DONATION_IN_PROGRESS",label: "Donation In Progress",   desc: "Blood donation is underway." },
  { key: "COMPLETED",           label: "Request Completed",      desc: "Blood has been donated. Thank you!" },
];

const URGENCY_COLOR = {
  LOW:      "text-green-400 bg-green-500/15",
  MEDIUM:   "text-yellow-400 bg-yellow-500/15",
  HIGH:     "text-orange-400 bg-orange-500/15",
  CRITICAL: "text-rq-red bg-rq-red/15",
};

function getStepStatus(stepKey, currentStatus) {
  const order = STEPS.map(s => s.key);
  const stepIdx    = order.indexOf(stepKey);
  const currentIdx = order.indexOf(currentStatus);
  if (currentStatus === "CANCELLED" || currentStatus === "EXPIRED") {
    return stepIdx === 0 ? "done" : "cancelled";
  }
  if (stepIdx < currentIdx)  return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function TrackBloodRequest() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = () => {
    getBloodRequestById(id)
      .then(d => { setRequest(d); setError(""); })
      .catch(() => setError("Could not load request. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [id]); // eslint-disable-line

  const isFinal = request && ["COMPLETED","CANCELLED","EXPIRED"].includes(request.status);

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back */}
        <Link to="/my-requests" className="inline-flex items-center gap-1.5 text-xs text-rq-muted hover:text-rq-red mb-6 transition-colors">
          <ArrowLeft size={14} /> My Requests
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">Blood Request Tracking</h1>
            <p className="text-sm text-rq-muted mt-0.5">Request #{id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {request && (
              <>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${URGENCY_COLOR[request.urgency] || ""}`}>
                  {request.urgency}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  request.status === "COMPLETED" ? "bg-green-500/15 text-green-400" :
                  request.status === "CANCELLED" ? "bg-rq-muted/15 text-rq-muted" :
                  "bg-sky-500/15 text-sky-400"
                }`}>
                  {request.status?.replace(/_/g," ")}
                </span>
              </>
            )}
            {!isFinal && (
              <button onClick={load} className="text-xs text-rq-muted hover:text-rq-red transition-colors">↻ Refresh</button>
            )}
          </div>
        </div>

        {loading && !request && <p className="text-sm text-rq-muted">Loading…</p>}
        {error && <p className="text-sm text-rq-red mb-4">{error}</p>}

        {request && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Timeline ── */}
            <div className="lg:col-span-2 bg-rq-panel border border-rq-border rounded-xl p-6">
              {/* Request summary */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-rq-border">
                <div className="w-14 h-14 rounded-xl bg-rq-red/10 flex items-center justify-center flex-shrink-0">
                  <Droplet className="text-rq-red" size={26} />
                </div>
                <div>
                  <p className="text-2xl font-black text-rq-red">{request.bloodGroup}</p>
                  <p className="text-sm text-rq-muted">
                    {request.units} unit(s) · {request.hospitalName || request.city || "—"}
                  </p>
                  {request.requesterName && (
                    <p className="text-xs text-rq-muted mt-0.5">Requested by {request.requesterName}</p>
                  )}
                </div>
              </div>

              {/* Steps */}
              {(request.status === "CANCELLED" || request.status === "EXPIRED") ? (
                <div className="text-center py-6">
                  <p className="text-rq-muted font-semibold text-sm">
                    This request was {request.status.toLowerCase()}.
                  </p>
                  <p className="text-xs text-rq-muted mt-1">{request.updatedAt?.slice(0,16).replace("T"," ")}</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {STEPS.map((step, i) => {
                    const s = getStepStatus(step.key, request.status);
                    return (
                      <li key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {s === "done"   && <CheckCircle2 className="text-rq-red" size={22} />}
                          {s === "active" && <Loader2 className="text-rq-red animate-spin" size={22} />}
                          {s === "pending"&& <Circle className="text-rq-border" size={22} />}
                          {i < STEPS.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-1 ${s === "done" ? "bg-rq-red/40" : "bg-rq-border"}`}
                              style={{ minHeight: 24 }} />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className={`text-sm font-semibold ${s === "pending" ? "text-rq-muted" : ""}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-rq-muted">{step.desc}</p>
                          {s !== "pending" && (
                            <p className="text-[10px] text-rq-muted mt-0.5">
                              {s === "active" ? "In progress…" : request.updatedAt?.slice(0,16).replace("T"," ")}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* ── Info cards ── */}
            <div className="space-y-4">
              {/* Matched donor */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Matched Donor</h3>
                {request.matchedDonorId ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rq-red/15 flex items-center justify-center text-rq-red font-bold">
                      D
                    </div>
                    <div>
                      <p className="text-sm font-medium">Donor #{request.matchedDonorId}</p>
                      <p className="text-xs text-rq-muted">{request.bloodGroup} · Confirmed</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rq-muted">No donor matched yet. Searching…</p>
                )}
              </div>

              {/* Request details */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold mb-1">Request Details</h3>
                {[
                  ["Blood Group",  request.bloodGroup || "—"],
                  ["Units Needed", request.units ? `${request.units} unit(s)` : "—"],
                  ["Hospital",     request.hospitalName || "—"],
                  ["City",         request.city || "—"],
                  ["Created",      request.createdAt?.slice(0,16).replace("T"," ") || "—"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-rq-muted">{l}</span>
                    <span className="font-medium text-right max-w-[55%] truncate">{v}</span>
                  </div>
                ))}
              </div>

              {/* Support */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-5">
                <p className="text-sm font-semibold mb-1">Need Help?</p>
                <p className="text-xs text-rq-muted mb-3">Contact our support team anytime.</p>
                <Button variant="outline" className="w-full text-xs py-2">Contact Support</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
