/**
 * Tracking.jsx
 * ---------------------------------------------------------------------
 * Loads GET /api/emergency-requests/:id and shows a live timeline.
 * Polls every 15 seconds to keep status fresh.
 * ---------------------------------------------------------------------
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, Phone } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { getEmergencyRequestById } from "../api/emergencies.js";

/** Map backend status strings to a timeline display.
 *  Handles both BloodRequestStatus and EmergencyStatus enums.
 */
const buildTimeline = (request) => {
  if (!request) return [];

  const status = (request.status || "").toUpperCase();

  // Blood request status flow
  const isBloodRequest = [
    "OPEN","MATCHING","DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED"
  ].includes(status);

  if (isBloodRequest) {
    return [
      { label: "Request Created",       done: true },
      { label: "Finding Donors",         done: ["MATCHING","DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED"].includes(status) },
      { label: "Donor Notified",         done: ["DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED"].includes(status) },
      { label: "Donor Accepted",         done: ["DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED"].includes(status) },
      { label: "Donation In Progress",   done: ["DONATION_IN_PROGRESS","COMPLETED"].includes(status), active: status === "DONATION_IN_PROGRESS" },
      { label: "Completed",              done: status === "COMPLETED" },
    ].map((s) => ({
      ...s,
      status: s.done ? (s.active ? "active" : "done") : "pending",
      time: s.done ? request.updatedAt || request.createdAt || "—" : "Pending",
    }));
  }

  // Emergency request status flow
  return [
    { label: "Request Created",    done: true },
    { label: "Request Open",       done: ["MATCHING","ASSIGNED","IN_PROGRESS","RESOLVED"].includes(status) },
    { label: "Responder Matched",  done: ["ASSIGNED","IN_PROGRESS","RESOLVED"].includes(status) },
    { label: "Help On The Way",    done: ["IN_PROGRESS","RESOLVED"].includes(status), active: status === "IN_PROGRESS" },
    { label: "Resolved",           done: status === "RESOLVED" },
  ].map((s) => ({
    ...s,
    status: s.done ? (s.active ? "active" : "done") : "pending",
    time: s.done ? request.updatedAt || request.createdAt || "—" : "Pending",
  }));
};

export default function Tracking() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequest = () => {
    getEmergencyRequestById(requestId)
      .then((data) => { setRequest(data); setError(""); })
      .catch(() => setError("Could not load request details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequest();
    const interval = setInterval(loadRequest, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeline = buildTimeline(request);

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Request Tracking</h1>
            <p className="text-sm text-rq-muted">Track the status of your request #{requestId}</p>
          </div>
          {request?.urgent !== false && (
            <span className="text-[10px] uppercase tracking-wide bg-rq-red/15 text-rq-red px-3 py-1 rounded-full">
              Urgent
            </span>
          )}
        </div>

        {loading && <p className="text-sm text-rq-muted">Loading…</p>}
        {error && <p className="text-sm text-rq-red mb-4">{error}</p>}

        {request && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2 bg-rq-panel border border-rq-border rounded-xl p-6">
              <div className="mb-6">
                <p className="font-semibold">
                  {request.bloodGroup ? `${request.bloodGroup} ` : ""}
                  {request.requestType || "Emergency"} Required
                </p>
                <p className="text-xs text-rq-muted">
                  {request.hospitalName || "—"} · {request.units ? `${request.units} Unit(s)` : "—"}
                </p>
              </div>

              <ul className="space-y-6">
                {timeline.map((step, i) => (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.status === "done"    && <CheckCircle2 className="text-rq-red" size={20} />}
                      {step.status === "active"  && <Loader2 className="text-rq-red animate-spin" size={20} />}
                      {step.status === "pending" && <Circle className="text-rq-muted" size={20} />}
                      {i < timeline.length - 1 && (
                        <div
                          className={`w-px flex-1 mt-1 ${step.status === "pending" ? "bg-rq-border" : "bg-rq-red/40"}`}
                          style={{ minHeight: "24px" }}
                        />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${step.status === "pending" ? "text-rq-muted" : ""}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-rq-muted">{step.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact cards */}
            <div className="space-y-6">
              {/* Donor */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4">Donor Details</h3>
                {request.matchedDonor ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-rq-red/15 flex items-center justify-center font-semibold text-rq-red">
                        {(request.matchedDonor.name || "D").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{request.matchedDonor.name}</p>
                        <p className="text-xs text-rq-muted">{request.matchedDonor.bloodGroup}</p>
                      </div>
                    </div>
                    <Button variant="outline" icon={Phone} className="w-full">Contact</Button>
                  </>
                ) : (
                  <p className="text-xs text-rq-muted">Searching for a donor…</p>
                )}
              </div>

              {/* Hospital */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4">Hospital</h3>
                <p className="text-sm font-medium">{request.hospitalName || "—"}</p>
                <p className="text-xs text-rq-muted mb-4">{request.location || "—"}</p>
                <Button variant="outline" icon={Phone} className="w-full">Call Hospital</Button>
              </div>

              {/* Support */}
              <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-1">Need More Help?</h3>
                <p className="text-xs text-rq-muted mb-4">Our team is here to assist you.</p>
                <Button className="w-full">Contact Support</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
