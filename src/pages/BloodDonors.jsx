/**
 * BloodDonors.jsx
 * ---------------------------------------------------------------------
 * Two separate operations on one page:
 *
 * Tab 1 — "Find Blood" (anyone who needs blood)
 *   → Searches GET /api/blood-donors/search
 *   → CTA to /blood-request to raise a new request
 *
 * Tab 2 — "Respond to Request" (registered donors only)
 *   → Lists open blood requests from GET /api/blood-requests
 *   → Donor clicks "I Can Help" to respond (status update)
 *   → If not a donor → nudge to /donor-register
 * ---------------------------------------------------------------------
 */
import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Droplet, HeartHandshake, X, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import BloodCard from "../components/BloodCard.jsx";
import Button from "../components/Button.jsx";
import { searchDonors, getMyDonorProfile } from "../api/donors.js";
import { getBloodRequests } from "../api/emergencies.js";
import { useAuth } from "../context/AuthContext.jsx";
import bloodDropEffect from "../assets/effects/effect_blood_drop.png";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const COMPATIBILITY = {
  "O+":  { donateTo: ["O+", "A+", "B+", "AB+"],        receiveFrom: ["O+", "O-"] },
  "O-":  { donateTo: ["Everyone"],                       receiveFrom: ["O-"] },
  "A+":  { donateTo: ["A+", "AB+"],                      receiveFrom: ["A+", "A-", "O+", "O-"] },
  "A-":  { donateTo: ["A+", "A-", "AB+", "AB-"],         receiveFrom: ["A-", "O-"] },
  "B+":  { donateTo: ["B+", "AB+"],                      receiveFrom: ["B+", "B-", "O+", "O-"] },
  "B-":  { donateTo: ["B+", "B-", "AB+", "AB-"],         receiveFrom: ["B-", "O-"] },
  "AB+": { donateTo: ["AB+"],                            receiveFrom: ["Everyone"] },
  "AB-": { donateTo: ["AB+", "AB-"],                     receiveFrom: ["AB-", "A-", "B-", "O-"] },
};

const URGENCY_COLOR = {
  LOW:      "bg-green-500/15 text-green-400",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400",
  HIGH:     "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-rq-red/15 text-rq-red",
};

export default function BloodDonors() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState("find"); // "find" | "respond"

  /* ── Find Blood state ── */
  const [bloodGroup, setBloodGroup] = useState("All");
  const [location, setLocation]     = useState("");
  const [radius, setRadius]         = useState("5");
  const [donors, setDonors]         = useState([]);
  const [donorLoading, setDonorLoading] = useState(false);
  const [donorError, setDonorError]     = useState("");
  const compat = COMPATIBILITY[bloodGroup] ?? null;

  /* ── Respond state ── */
  const [isDonor, setIsDonor]           = useState(null);
  const [openRequests, setOpenRequests] = useState([]);
  const [reqLoading, setReqLoading]     = useState(false);
  const [reqError, setReqError]         = useState("");
  const [responding, setResponding]     = useState(null);
  const [helpedRequest, setHelpedRequest] = useState(null); // modal after "I Can Help"

  /* ── Fetch donors ── */
  const fetchDonors = useCallback(() => {
    setDonorLoading(true);
    setDonorError("");
    const params = {};
    if (bloodGroup && bloodGroup !== "All") params.bloodGroup = bloodGroup;
    if (location) params.city = location;
    if (radius)   params.radius = radius;
    searchDonors(params)
      .then((data) => setDonors(Array.isArray(data) ? data : data?.content ?? []))
      .catch(() => setDonorError("Failed to load donors."))
      .finally(() => setDonorLoading(false));
  }, [bloodGroup, location, radius]);

  useEffect(() => { fetchDonors(); }, []); // eslint-disable-line

  /* ── When switching to Respond tab ── */
  useEffect(() => {
    if (tab !== "respond") return;

    // Check if current user is a registered donor
    if (isLoggedIn && isDonor === null) {
      getMyDonorProfile()
        .then(() => setIsDonor(true))
        .catch(() => setIsDonor(false));
    }

    // Load open blood requests
    setReqLoading(true);
    getBloodRequests({ status: "OPEN" })
      .then((data) => setOpenRequests(Array.isArray(data) ? data : data?.content ?? []))
      .catch(() => setReqError("Failed to load requests."))
      .finally(() => setReqLoading(false));
  }, [tab]); // eslint-disable-line

  /* ── Donor responds to a request — show requester details directly ── */
  const handleRespond = (req) => {
    setHelpedRequest(req);
  };

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-xl font-bold mb-1">Blood Donation</h1>
        <p className="text-sm text-rq-muted mb-6">
          Find a donor for your need, or respond to someone who needs help.
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-rq-border">
          <TabBtn active={tab === "find"}    onClick={() => setTab("find")}    icon={Search}        label="Find Blood" />
          <TabBtn active={tab === "respond"} onClick={() => setTab("respond")} icon={HeartHandshake} label="Respond as Donor" />
        </div>

        {/* ══════════════════════ TAB 1 — FIND BLOOD ══════════════════════ */}
        {tab === "find" && (
          <>
            {/* Search bar */}
            <div className="bg-rq-panel border border-rq-border rounded-xl p-5 grid md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-xs text-rq-muted mb-1 block">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-rq-bg border border-rq-border rounded-lg px-3 py-2 text-sm outline-none focus:border-rq-red"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-rq-muted mb-1 block">City</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full bg-rq-bg border border-rq-border rounded-lg px-3 py-2 text-sm outline-none focus:border-rq-red"
                />
              </div>
              <div>
                <label className="text-xs text-rq-muted mb-1 block">Radius (km)</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full bg-rq-bg border border-rq-border rounded-lg px-3 py-2 text-sm outline-none focus:border-rq-red"
                >
                  {["5", "10", "20", "50"].map((r) => (
                    <option key={r} value={r}>{r} km</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button icon={Search} className="w-full" onClick={fetchDonors} disabled={donorLoading}>
                  {donorLoading ? "Searching…" : "Search"}
                </Button>
              </div>
            </div>

            {donorError && <p className="text-sm text-rq-red mb-4">{donorError}</p>}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Donor list */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-semibold text-rq-muted">Available Donors</h2>
                {donorLoading && <p className="text-sm text-rq-muted">Loading donors…</p>}
                {!donorLoading && donors.length === 0 && (
                  <p className="text-sm text-rq-muted">
                    No donors found{bloodGroup !== "All" ? ` for ${bloodGroup}` : ""} nearby.
                  </p>
                )}
                {donors.map((donor) => (
                  <BloodCard
                    key={donor.id}
                    userId={donor.userId}
                    name={donor.donorName || donor.fullName || donor.name || "Unknown Donor"}
                    bloodGroup={donor.bloodGroup}
                    distance={donor.distance ? `${donor.distance} km away` : "—"}
                    lastDonated={donor.lastDonationDate || "—"}
                    available={donor.available ?? true}
                  />
                ))}
              </div>

              {/* Compatibility + CTA */}
              <div className="space-y-6">
                {compat ? (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-6 text-center">
                    <p className="text-xs text-rq-muted mb-2">Compatibility</p>
                    <div className="w-20 h-20 mx-auto rounded-full bg-rq-red/15 flex items-center justify-center mb-4 overflow-hidden">
                      <img src={bloodDropEffect} alt="Blood drop" className="w-16 h-16 object-contain rounded-full" />
                    </div>
                    <p className="text-2xl font-bold mb-4">{bloodGroup}</p>
                    <div className="text-left text-xs text-rq-muted space-y-3">
                      <div>
                        <p className="text-rq-text font-semibold mb-1">Can Donate To</p>
                        <div className="flex flex-wrap gap-2">
                          {compat.donateTo.map((g) => (
                            <span key={g} className="px-2 py-1 rounded-full bg-rq-red/10 text-rq-red">{g}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-rq-text font-semibold mb-1">Can Receive From</p>
                        <div className="flex flex-wrap gap-2">
                          {compat.receiveFrom.map((g) => (
                            <span key={g} className="px-2 py-1 rounded-full bg-rq-panel border border-rq-border">{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-6 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-rq-red/15 flex items-center justify-center mb-4 overflow-hidden">
                      <img src={bloodDropEffect} alt="Blood drop" className="w-16 h-16 object-contain rounded-full" />
                    </div>
                    <p className="text-sm font-semibold mb-1">All Blood Groups</p>
                    <p className="text-xs text-rq-muted">Select a specific blood group to see compatibility info.</p>
                  </div>
                )}

                <div className="bg-rq-panel border border-rq-border rounded-xl p-6 text-center">
                  <AlertTriangle className="text-rq-red mx-auto mb-3" size={26} />
                  <p className="text-sm font-semibold mb-1">Need Blood Urgently?</p>
                  <p className="text-xs text-rq-muted mb-4">
                    Raise a request and we'll notify nearby donors immediately.
                  </p>
                  <Button as="link" to="/blood-request" className="w-full">
                    Request Blood Now
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════ TAB 2 — RESPOND AS DONOR ══════════════════════ */}
        {tab === "respond" && (
          <>
            {/* Not logged in */}
            {!isLoggedIn && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <Droplet className="text-rq-red mx-auto mb-4" size={36} />
                <h2 className="text-lg font-bold mb-2">Login to Respond</h2>
                <p className="text-sm text-rq-muted mb-6">You need to be logged in to respond to blood requests.</p>
                <Button as="link" to="/login">Login</Button>
              </div>
            )}

            {/* Logged in but not a donor */}
            {isLoggedIn && isDonor === false && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <Droplet className="text-rq-red mx-auto mb-4" size={36} />
                <h2 className="text-lg font-bold mb-2">Register as a Donor First</h2>
                <p className="text-sm text-rq-muted mb-6">
                  To respond to blood requests, you need to be a registered blood donor.
                </p>
                <Button as="link" to="/donor-register" icon={Droplet}>Register as Donor</Button>
              </div>
            )}

            {/* Registered donor — show open requests */}
            {isLoggedIn && isDonor === true && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold">Open Blood Requests Near You</h2>
                    <p className="text-xs text-rq-muted mt-1">
                      These people are waiting for a donor. Click "I Can Help" to respond.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setReqLoading(true);
                    getBloodRequests({ status: "OPEN" })
                      .then((data) => setOpenRequests(Array.isArray(data) ? data : data?.content ?? []))
                      .catch(() => setReqError("Failed to reload."))
                      .finally(() => setReqLoading(false));
                  }}>
                    Refresh
                  </Button>
                </div>

                {reqError  && <p className="text-sm text-rq-red mb-4">{reqError}</p>}
                {reqLoading && <p className="text-sm text-rq-muted mb-4">Loading requests…</p>}

                {!reqLoading && openRequests.length === 0 && (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                    <p className="text-sm text-rq-muted">No open blood requests right now. Check back soon.</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {openRequests.map((req) => (
                    <div key={req.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-4 hover:border-rq-red/60 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-rq-red/10 flex items-center justify-center">
                            <Droplet className="text-rq-red" size={22} />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-rq-red">{req.bloodGroup}</p>
                            <p className="text-xs text-rq-muted">{req.hospitalName || "—"}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${URGENCY_COLOR[req.urgency] || "bg-rq-muted/10 text-rq-muted"}`}>
                          {req.urgency}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-rq-muted">
                        <span>📍 {req.city || "—"}</span>
                        <span>🩸 {req.units} unit(s) needed</span>
                        <span>👤 {req.requesterName || "—"}</span>
                        <span>📋 {req.status}</span>
                      </div>

                      <Button
                        icon={HeartHandshake}
                        className="w-full"
                        onClick={() => handleRespond(req)}
                      >
                        I Can Help
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Checking donor status */}
            {isLoggedIn && isDonor === null && (
              <p className="text-sm text-rq-muted">Checking your donor status…</p>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* ══ REQUESTER DETAILS MODAL (after "I Can Help") ══ */}
      {helpedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setHelpedRequest(null)}
        >
          <div
            className="bg-rq-bg border border-rq-border rounded-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHelpedRequest(null)}
              className="absolute top-4 right-4 text-rq-muted hover:text-rq-red"
            >
              <X size={20} />
            </button>

            {/* Success header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-3">
                <CheckCircle2 className="text-green-400" size={32} />
              </div>
              <h2 className="text-lg font-bold">You're Helping!</h2>
              <p className="text-sm text-rq-muted mt-1">
                Here are the requester's details so you can coordinate directly.
              </p>
            </div>

            {/* Request details */}
            <div className="bg-rq-panel border border-rq-border rounded-xl p-4 space-y-3 mb-5">
              {/* Blood group badge */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-rq-red/10 flex items-center justify-center">
                  <Droplet className="text-rq-red" size={22} />
                </div>
                <div>
                  <p className="font-bold text-xl text-rq-red">{helpedRequest.bloodGroup}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLOR[helpedRequest.urgency] || "bg-rq-muted/10 text-rq-muted"}`}>
                    {helpedRequest.urgency}
                  </span>
                </div>
              </div>

              {[
                ["Requester",    helpedRequest.requesterName  || "—"],
                ["Hospital",     helpedRequest.hospitalName   || "—"],
                ["City",         helpedRequest.city           || "—"],
                ["Units Needed", helpedRequest.units ? `${helpedRequest.units} unit(s)` : "—"],
                ["Contact",      helpedRequest.contactNumber  || helpedRequest.contactPhone || "—"],
                ["Notes",        helpedRequest.notes          || helpedRequest.description  || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-rq-border/40 last:border-0">
                  <p className="text-xs text-rq-muted w-28 flex-shrink-0">{label}</p>
                  <p className="text-sm font-medium text-right">{value}</p>
                </div>
              ))}
            </div>

            {/* Call button if phone available */}
            {(helpedRequest.contactNumber || helpedRequest.contactPhone) && (
              <a
                href={`tel:${helpedRequest.contactNumber || helpedRequest.contactPhone}`}
                className="flex items-center justify-center gap-2 w-full bg-rq-red text-white rounded-lg py-3 text-sm font-semibold hover:bg-red-700 transition-colors mb-3"
              >
                <Phone size={16} /> Call Requester
              </a>
            )}

            {/* Location hint */}
            {helpedRequest.city && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent((helpedRequest.hospitalName ? helpedRequest.hospitalName + ', ' : '') + helpedRequest.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-rq-border rounded-lg py-3 text-sm font-semibold hover:border-rq-red transition-colors mb-3"
              >
                <MapPin size={16} /> Open Location in Maps
              </a>
            )}

            <button
              onClick={() => setHelpedRequest(null)}
              className="w-full text-xs text-rq-muted hover:text-rq-text py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
        active
          ? "border-rq-red text-rq-red"
          : "border-transparent text-rq-muted hover:text-rq-text"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
