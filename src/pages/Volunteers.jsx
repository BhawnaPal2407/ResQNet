/**
 * Volunteers.jsx
 * ─────────────────────────────────────────────────────────────────
 * Three sections across two tabs:
 *
 * Tab 1 — DIRECTORY
 *   1a. MY REGISTRATION — if logged in, shows the user's own volunteer
 *       profile (GET /api/volunteers/me) with status + toggle.
 *       If not yet registered → shows the registration form.
 *   1b. VOLUNTEER DIRECTORY — lists APPROVED volunteers from
 *       GET /api/volunteers (public).
 *
 * Tab 2 — RESPOND TO EMERGENCY
 *   → Only for APPROVED volunteers
 *   → Lists open emergency requests (GET /api/emergency-requests?status=OPEN)
 *   → "I Can Help" button → PATCH status to RESPONDING
 *   → After clicking, shows a modal with the requester's full details
 * ─────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from "react";
import {
  Search, MapPin, Users, X, Phone, CheckCircle2, Clock, XCircle,
  ToggleLeft, ToggleRight, HeartHandshake, AlertTriangle, Navigation,
  Stethoscope, ExternalLink, Pencil,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import {
  getVolunteers,
  getMyVolunteerProfile,
  registerAsVolunteer,
  toggleVolunteerAvailability,
  updateVolunteerProfile,
} from "../api/volunteers.js";
import { getEmergencyRequests } from "../api/emergencies.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ── Shared constants ────────────────────────────────────────── */
const VERIFY_COLOR = {
  PENDING:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  APPROVED:  "bg-green-500/15 text-green-400 border-green-500/30",
  REJECTED:  "bg-rq-red/15 text-rq-red border-rq-red/30",
  SUSPENDED: "bg-rq-muted/15 text-rq-muted border-rq-border",
};
const VERIFY_ICON = {
  PENDING:   Clock,
  APPROVED:  CheckCircle2,
  REJECTED:  XCircle,
  SUSPENDED: XCircle,
};

const URGENCY_COLOR = {
  LOW:      "bg-green-500/15 text-green-400 border-green-500/30",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  HIGH:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CRITICAL: "bg-rq-red/15 text-rq-red border-rq-red/30",
};

const CATEGORY_ICON = {
  MEDICAL_EMERGENCY: "🏥",
  ROAD_ACCIDENT:     "🚗",
  FIRE:              "🔥",
  NATURAL_DISASTER:  "🌊",
  MISSING_PERSON:    "🔍",
  RESCUE:            "🛟",
  OTHER:             "⚡",
};

/* ── Tab button ──────────────────────────────────────────────── */
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

/* ── Main page ───────────────────────────────────────────────── */
export default function Volunteers() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState("directory"); // "directory" | "respond"

  /* ── Directory state ── */
  const [volunteers,  setVolunteers]  = useState([]);
  const [dirLoading,  setDirLoading]  = useState(true);
  const [dirError,    setDirError]    = useState("");
  const [query,       setQuery]       = useState("");
  const [selected,    setSelected]    = useState(null); // volunteer detail modal

  /* ── My registration state ── */
  const [myProfile,   setMyProfile]   = useState(undefined); // undefined=checking, null=not registered
  const [toggling,    setToggling]    = useState(false);

  /* ── Register form state ── */
  const [showForm,    setShowForm]    = useState(false);
  const [regForm,     setRegForm]     = useState({
    organizationName: "", services: "", serviceArea: "",
    contactName: "", contactPhone: "", available: true,
  });
  const [regLoading,  setRegLoading]  = useState(false);
  const [regError,    setRegError]    = useState("");

  /* ── Edit profile state ── */
  const [showEdit,    setShowEdit]    = useState(false);
  const [editForm,    setEditForm]    = useState({
    organizationName: "", services: "", serviceArea: "",
    contactName: "", contactPhone: "", available: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState("");

  /* ── Respond tab state ── */
  const [openRequests,  setOpenRequests]  = useState([]);
  const [reqLoading,    setReqLoading]    = useState(false);
  const [reqError,      setReqError]      = useState("");
  const [helpedRequest, setHelpedRequest] = useState(null); // modal after "I Can Help"

  /* Load volunteer directory */
  useEffect(() => {
    getVolunteers()
      .then((d) => setVolunteers(Array.isArray(d) ? d : d?.content ?? []))
      .catch(() => setDirError("Failed to load volunteers."))
      .finally(() => setDirLoading(false));
  }, []);

  /* Load my profile if logged in */
  useEffect(() => {
    if (!isLoggedIn) { setMyProfile(null); return; }
    getMyVolunteerProfile()
      .then(setMyProfile)
      .catch(() => setMyProfile(null));
  }, [isLoggedIn]);

  /* Load open emergency requests when Respond tab is active */
  useEffect(() => {
    if (tab !== "respond") return;
    loadOpenRequests();
  }, [tab]); // eslint-disable-line

  const loadOpenRequests = () => {
    setReqLoading(true);
    setReqError("");
    getEmergencyRequests({ status: "OPEN" })
      .then((d) => setOpenRequests(Array.isArray(d) ? d : d?.content ?? []))
      .catch(() => setReqError("Failed to load emergency requests."))
      .finally(() => setReqLoading(false));
  };

  const handleToggle = async () => {
    setToggling(true);
    try { setMyProfile(await toggleVolunteerAvailability()); }
    catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegError(""); setRegLoading(true);
    try {
      const profile = await registerAsVolunteer({
        ...(regForm.organizationName && { organizationName: regForm.organizationName }),
        ...(regForm.services         && { services:         regForm.services }),
        ...(regForm.serviceArea      && { serviceArea:      regForm.serviceArea }),
        ...(regForm.contactName      && { contactName:      regForm.contactName }),
        ...(regForm.contactPhone     && { contactPhone:     regForm.contactPhone }),
        available: regForm.available,
      });
      setMyProfile(profile);
      setShowForm(false);
    } catch (err) {
      const d = err.response?.data;
      setRegError(
        typeof d === "string"  ? d :
        d?.message             ? d.message :
        d?.errors              ? Object.values(d.errors).join(", ") :
        !err.response          ? "Cannot reach server." : "Registration failed."
      );
    } finally { setRegLoading(false); }
  };

  /* Open edit form pre-filled with current profile values */
  const openEdit = () => {
    setEditForm({
      organizationName: myProfile.organizationName || "",
      services:         myProfile.services         || "",
      serviceArea:      myProfile.serviceArea       || "",
      contactName:      myProfile.contactName       || "",
      contactPhone:     myProfile.contactPhone      || "",
      available:        myProfile.available ?? true,
    });
    setEditError("");
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(""); setEditLoading(true);
    try {
      const updated = await updateVolunteerProfile({
        organizationName: editForm.organizationName,
        services:         editForm.services,
        serviceArea:      editForm.serviceArea,
        contactName:      editForm.contactName,
        contactPhone:     editForm.contactPhone,
        available:        editForm.available,
      });
      setMyProfile(updated);
      setShowEdit(false);
    } catch (err) {
      const d = err.response?.data;
      setEditError(
        typeof d === "string"  ? d :
        d?.message             ? d.message :
        d?.errors              ? Object.values(d.errors).join(", ") :
        !err.response          ? "Cannot reach server." : "Update failed."
      );
    } finally { setEditLoading(false); }
  };

  /* Volunteer clicks "I Can Help" — show requester details directly */
  const handleICanHelp = (req) => {
    setHelpedRequest(req);
  };
  const filtered = volunteers.filter((v) =>
    query === "" ||
    (v.volunteerName || v.contactName || v.organizationName || "").toLowerCase().includes(query.toLowerCase()) ||
    (v.serviceArea || "").toLowerCase().includes(query.toLowerCase()) ||
    (v.services    || "").toLowerCase().includes(query.toLowerCase())
  );

  const StatusIcon = myProfile ? (VERIFY_ICON[myProfile.verificationStatus] || Clock) : Clock;
  const isApprovedVolunteer = myProfile?.verificationStatus === "APPROVED";

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Tab switcher ── */}
        <h1 className="text-xl font-bold mb-1">Volunteers</h1>
        <p className="text-sm text-rq-muted mb-6">
          Browse the volunteer directory or respond to active emergencies.
        </p>
        <div className="flex gap-2 mb-8 border-b border-rq-border">
          <TabBtn active={tab === "directory"} onClick={() => setTab("directory")} icon={Users}         label="Volunteer Directory" />
          <TabBtn active={tab === "respond"}   onClick={() => setTab("respond")}   icon={HeartHandshake} label="Respond to Emergency" />
        </div>

        {/* ══════════════════════════════════════════════════
            TAB 1 — DIRECTORY
        ══════════════════════════════════════════════════ */}
        {tab === "directory" && (
          <>
            {/* ── MY REGISTRATION SECTION ── */}
            {isLoggedIn && myProfile !== undefined && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold text-rq-muted uppercase tracking-widest mb-4">
                  My Volunteer Profile
                </h2>

                {myProfile === null && !showForm ? (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold">You are not registered as a volunteer yet.</p>
                      <p className="text-sm text-rq-muted mt-1">
                        Register to get notified when help is needed near you.
                      </p>
                    </div>
                    <Button icon={Users} onClick={() => setShowForm(true)}>
                      Register as Volunteer
                    </Button>
                  </div>
                ) : myProfile === null && showForm ? (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold">Volunteer Registration</h3>
                      <button onClick={() => setShowForm(false)} className="text-rq-muted hover:text-rq-red">
                        <X size={18} />
                      </button>
                    </div>
                    {regError && (
                      <div className="mb-4 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
                        {regError}
                      </div>
                    )}
                    <form onSubmit={handleRegSubmit} className="grid sm:grid-cols-2 gap-4">
                      <RegField label="Organization Name" name="organizationName" value={regForm.organizationName} onChange={(e) => setRegForm({ ...regForm, organizationName: e.target.value })} placeholder="e.g. Red Cross Delhi" required />
                      <RegField label="Services You Offer" name="services" value={regForm.services} onChange={(e) => setRegForm({ ...regForm, services: e.target.value })} placeholder="e.g. First aid, Blood transport" required />
                      <RegField label="Service Area / City" name="serviceArea" value={regForm.serviceArea} onChange={(e) => setRegForm({ ...regForm, serviceArea: e.target.value })} placeholder="e.g. Delhi, NCR" required />
                      <RegField label="Contact Name" name="contactName" value={regForm.contactName} onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })} placeholder="Your name" required />
                      <RegField label="Contact Phone" name="contactPhone" value={regForm.contactPhone} onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })} placeholder="+91 98765 43210" required />
                      <div className="flex items-center sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm text-rq-muted cursor-pointer">
                          <input type="checkbox" checked={regForm.available} onChange={(e) => setRegForm({ ...regForm, available: e.target.checked })} className="accent-rq-red" />
                          I am currently available to help
                        </label>
                      </div>
                      <div className="sm:col-span-2 flex gap-3">
                        <Button type="submit" className="flex-1" disabled={regLoading}>
                          {regLoading ? "Submitting…" : "Submit Registration"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                ) : myProfile ? (
                  <>
                  {/* ── Profile card ── */}
                  {!showEdit && (
                  <div className={`border rounded-xl p-6 ${VERIFY_COLOR[myProfile.verificationStatus] || VERIFY_COLOR.PENDING}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xl flex-shrink-0">
                          {(myProfile.volunteerName || myProfile.contactName || myProfile.organizationName || "V").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{myProfile.volunteerName || myProfile.contactName || "—"}</p>
                          <p className="text-sm opacity-75">{myProfile.organizationName || "Independent Volunteer"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openEdit}
                          className="flex items-center gap-1.5 text-xs font-semibold border border-current/30 rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity"
                        >
                          <Pencil size={13} /> Edit Profile
                        </button>
                        <div className="flex items-center gap-2">
                          <StatusIcon size={16} />
                          <span className="text-sm font-semibold">{myProfile.verificationStatus || "PENDING"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
                      <InfoCell label="Services"     value={myProfile.services     || "—"} />
                      <InfoCell label="Service Area" value={myProfile.serviceArea  || "—"} />
                      <InfoCell label="Phone"        value={myProfile.contactPhone || "—"} />
                      <InfoCell label="Available"    value={myProfile.available ? "Yes" : "No"} />
                    </div>

                    {myProfile.verificationStatus === "PENDING" && (
                      <p className="text-xs mt-4 opacity-75">
                        ⏳ Your profile is under review. An admin will approve it shortly.
                      </p>
                    )}
                    {myProfile.verificationStatus === "APPROVED" && (
                      <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <button
                          onClick={handleToggle}
                          disabled={toggling}
                          className="flex items-center gap-2 text-sm font-semibold border border-current/30 rounded-lg px-4 py-2 hover:opacity-80 transition-opacity"
                        >
                          {myProfile.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          {toggling ? "Updating…" : myProfile.available ? "Mark Unavailable" : "Mark Available"}
                        </button>
                        <button
                          onClick={() => setTab("respond")}
                          className="flex items-center gap-2 text-sm font-semibold bg-rq-red/10 border border-rq-red/30 text-rq-red rounded-lg px-4 py-2 hover:bg-rq-red/20 transition-colors"
                        >
                          <HeartHandshake size={16} />
                          Respond to Emergencies
                        </button>
                      </div>
                    )}
                  </div>
                  )}

                  {/* ── Edit form ── */}
                  {showEdit && (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold">Edit Volunteer Profile</h3>
                      <button onClick={() => setShowEdit(false)} className="text-rq-muted hover:text-rq-red">
                        <X size={18} />
                      </button>
                    </div>
                    {editError && (
                      <div className="mb-4 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
                        {editError}
                      </div>
                    )}
                    <form onSubmit={handleEditSubmit} className="grid sm:grid-cols-2 gap-4">
                      <RegField label="Organization Name" name="organizationName" value={editForm.organizationName} onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })} placeholder="e.g. Red Cross Delhi" required />
                      <RegField label="Services You Offer" name="services" value={editForm.services} onChange={(e) => setEditForm({ ...editForm, services: e.target.value })} placeholder="e.g. First aid, Blood transport" required />
                      <RegField label="Service Area / City" name="serviceArea" value={editForm.serviceArea} onChange={(e) => setEditForm({ ...editForm, serviceArea: e.target.value })} placeholder="e.g. Delhi, NCR" required />
                      <RegField label="Contact Name" name="contactName" value={editForm.contactName} onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })} placeholder="Your name" required />
                      <RegField label="Contact Phone" name="contactPhone" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} placeholder="+91 98765 43210" required />
                      <div className="flex items-center sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm text-rq-muted cursor-pointer">
                          <input type="checkbox" checked={editForm.available} onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })} className="accent-rq-red" />
                          I am currently available to help
                        </label>
                      </div>
                      <div className="sm:col-span-2 flex gap-3">
                        <Button type="submit" className="flex-1" disabled={editLoading}>
                          {editLoading ? "Saving…" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                  )}
                  </>
                ) : null}
              </div>
            )}

            {/* ── VOLUNTEER DIRECTORY ── */}
            <h2 className="text-sm font-semibold text-rq-muted uppercase tracking-widest mb-2">
              Volunteer Directory
            </h2>
            <p className="text-sm text-rq-muted mb-6">Approved volunteers ready to help in emergencies.</p>

            {/* Search */}
            <div className="flex items-center gap-2 bg-rq-panel border border-rq-border rounded-lg px-4 py-3 mb-8">
              <Search size={16} className="text-rq-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, city, services…"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {dirError  && <p className="text-sm text-rq-red mb-4">{dirError}</p>}
            {dirLoading && <p className="text-sm text-rq-muted mb-4">Loading volunteers…</p>}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {filtered.map((v) => {
                const name     = v.volunteerName || v.contactName || "Volunteer";
                const org      = v.organizationName || "Independent";
                const area     = v.serviceArea || "—";
                const services = v.services || "General Support";
                return (
                  <div
                    key={v.id}
                    className="bg-rq-panel border border-rq-border rounded-xl p-5 hover:border-rq-red/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center font-bold text-blue-400 text-lg flex-shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{name}</p>
                        <p className="text-xs text-rq-muted truncate">{org}</p>
                      </div>
                    </div>

                    <p className="text-xs text-rq-muted mb-1">Services</p>
                    <p className="text-xs font-medium mb-3 line-clamp-2">{services}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-rq-muted flex items-center gap-1">
                        <MapPin size={11} /> {area}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        v.available ? "bg-green-500/15 text-green-400" : "bg-rq-muted/15 text-rq-muted"
                      }`}>
                        {v.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <Button variant="outline" className="w-full text-xs py-2" onClick={() => setSelected(v)}>
                      View Profile
                    </Button>
                  </div>
                );
              })}

              {!dirLoading && filtered.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Users className="text-rq-muted mx-auto mb-3" size={32} />
                  <p className="text-sm text-rq-muted">
                    {volunteers.length === 0
                      ? "No approved volunteers yet. Be the first to register!"
                      : "No volunteers match your search."}
                  </p>
                </div>
              )}
            </div>

            {/* CTA for non-logged-in users */}
            {!isLoggedIn && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <Users className="text-rq-red mx-auto mb-4" size={32} />
                <h2 className="text-lg font-bold mb-2">Want to Join as a Volunteer?</h2>
                <p className="text-sm text-rq-muted mb-6 max-w-md mx-auto">
                  Create an account to register as a volunteer and start making a difference.
                </p>
                <Button as="link" to="/signup" icon={Users}>Sign Up to Volunteer</Button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2 — RESPOND TO EMERGENCY
        ══════════════════════════════════════════════════ */}
        {tab === "respond" && (
          <>
            {/* Not logged in */}
            {!isLoggedIn && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <HeartHandshake className="text-rq-red mx-auto mb-4" size={36} />
                <h2 className="text-lg font-bold mb-2">Login to Respond</h2>
                <p className="text-sm text-rq-muted mb-6">
                  You need to be logged in to respond to emergency requests.
                </p>
                <Button as="link" to="/login">Login</Button>
              </div>
            )}

            {/* Logged in but not a volunteer */}
            {isLoggedIn && myProfile === null && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <Users className="text-rq-red mx-auto mb-4" size={36} />
                <h2 className="text-lg font-bold mb-2">Register as a Volunteer First</h2>
                <p className="text-sm text-rq-muted mb-6">
                  To respond to emergency requests you need to be a registered volunteer.
                </p>
                <Button onClick={() => { setTab("directory"); setShowForm(true); }} icon={Users}>
                  Register as Volunteer
                </Button>
              </div>
            )}

            {/* Registered but pending / rejected */}
            {isLoggedIn && myProfile && !isApprovedVolunteer && (
              <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                <Clock className="text-yellow-400 mx-auto mb-4" size={36} />
                <h2 className="text-lg font-bold mb-2">
                  {myProfile.verificationStatus === "PENDING" ? "Approval Pending" : "Account Suspended"}
                </h2>
                <p className="text-sm text-rq-muted mb-2">
                  {myProfile.verificationStatus === "PENDING"
                    ? "Your volunteer profile is currently under review by an admin."
                    : "Your volunteer account has been suspended. Contact support for help."}
                </p>
                <p className="text-xs text-rq-muted">
                  Once approved, you'll be able to respond to emergency requests.
                </p>
              </div>
            )}

            {/* Approved volunteer — show open requests */}
            {isLoggedIn && isApprovedVolunteer && (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="font-semibold">Open Emergency Requests</h2>
                    <p className="text-xs text-rq-muted mt-1">
                      People waiting for help. Click <strong>"I Can Help"</strong> to send them your details.
                    </p>
                  </div>
                  <Button variant="outline" onClick={loadOpenRequests} disabled={reqLoading}>
                    {reqLoading ? "Refreshing…" : "Refresh"}
                  </Button>
                </div>

                {reqError  && <p className="text-sm text-rq-red mb-4">{reqError}</p>}
                {reqLoading && <p className="text-sm text-rq-muted mb-4">Loading requests…</p>}

                {!reqLoading && openRequests.length === 0 && (
                  <div className="bg-rq-panel border border-rq-border rounded-xl p-10 text-center">
                    <AlertTriangle className="text-rq-muted mx-auto mb-3" size={32} />
                    <p className="text-sm text-rq-muted">No open emergency requests right now. Check back soon.</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {openRequests.map((req) => {
                    const catIcon = CATEGORY_ICON[req.category] || "⚡";
                    const catLabel = req.category?.replace(/_/g, " ") || "Emergency";
                    const urgencyStyle = URGENCY_COLOR[req.urgency] || "bg-rq-muted/10 text-rq-muted border-rq-border";

                    return (
                      <div
                        key={req.id}
                        className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-4 hover:border-rq-red/60 transition-colors"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-rq-red/10 flex items-center justify-center text-2xl flex-shrink-0">
                              {catIcon}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{catLabel}</p>
                              <p className="text-xs text-rq-muted flex items-center gap-1 mt-0.5">
                                <MapPin size={11} /> {req.city || "—"}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold border ${urgencyStyle}`}>
                            {req.urgency}
                          </span>
                        </div>

                        {/* Description */}
                        {req.description && (
                          <p className="text-xs text-rq-muted line-clamp-2 border-l-2 border-rq-border pl-3">
                            {req.description}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-rq-muted">
                          <span>👤 {req.requesterName || req.userName || "Anonymous"}</span>
                          <span>📋 {req.status || "OPEN"}</span>
                          {req.latitude && req.longitude && (
                            <span className="col-span-2 flex items-center gap-1 text-green-400">
                              <Navigation size={11} /> GPS location available
                            </span>
                          )}
                          <span>🕐 {req.createdAt ? new Date(req.createdAt).toLocaleString() : "—"}</span>
                        </div>

                        {/* Action */}
                        <Button
                          icon={HeartHandshake}
                          className="w-full"
                          onClick={() => handleICanHelp(req)}
                        >
                          I Can Help
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Checking volunteer status */}
            {isLoggedIn && myProfile === undefined && (
              <p className="text-sm text-rq-muted">Checking your volunteer status…</p>
            )}
          </>
        )}
      </div>

      {/* ══ VOLUNTEER DETAIL MODAL ══ */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-rq-bg border border-rq-border rounded-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-rq-muted hover:text-rq-red"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-2xl">
                {(selected.volunteerName || selected.contactName || "V").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg">{selected.volunteerName || selected.contactName || "—"}</p>
                <p className="text-sm text-rq-muted">{selected.organizationName || "Independent Volunteer"}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  selected.available ? "bg-green-500/15 text-green-400" : "bg-rq-muted/15 text-rq-muted"
                }`}>
                  {selected.available ? "● Available" : "○ Unavailable"}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                ["Services Offered", selected.services     || "—"],
                ["Service Area",     selected.serviceArea  || "—"],
                ["Contact Name",     selected.contactName  || "—"],
                ["Contact Phone",    selected.contactPhone || "—"],
                ["Member Since",     selected.createdAt?.slice(0, 10) || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-2 border-b border-rq-border/50 last:border-0"
                >
                  <p className="text-xs text-rq-muted w-32 flex-shrink-0">{label}</p>
                  <p className="text-sm font-medium text-right">{value}</p>
                </div>
              ))}
            </div>

            {selected.contactPhone && selected.available && (
              <a
                href={`tel:${selected.contactPhone}`}
                className="flex items-center justify-center gap-2 w-full bg-rq-red text-white rounded-lg py-3 text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <Phone size={16} /> Call Volunteer
              </a>
            )}
          </div>
        </div>
      )}

      {/* ══ HELPED REQUEST — REQUESTER DETAILS MODAL ══ */}
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
              <h2 className="text-lg font-bold">You're Responding!</h2>
              <p className="text-sm text-rq-muted mt-1">
                The requester has been notified. Here are their details so you can coordinate.
              </p>
            </div>

            {/* Requester details */}
            <div className="bg-rq-panel border border-rq-border rounded-xl p-4 space-y-3 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{CATEGORY_ICON[helpedRequest.category] || "⚡"}</span>
                <div>
                  <p className="font-bold text-sm">{helpedRequest.category?.replace(/_/g, " ") || "Emergency"}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${URGENCY_COLOR[helpedRequest.urgency] || "bg-rq-muted/10 text-rq-muted border-rq-border"}`}>
                    {helpedRequest.urgency}
                  </span>
                </div>
              </div>

              {[
                ["Requester",    helpedRequest.requesterName || helpedRequest.userName || "Anonymous"],
                ["City",         helpedRequest.city || "—"],
                ["Description",  helpedRequest.description || "—"],
                ["Raised at",    helpedRequest.createdAt ? new Date(helpedRequest.createdAt).toLocaleString() : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3 py-2 border-b border-rq-border/40 last:border-0">
                  <p className="text-xs text-rq-muted w-24 flex-shrink-0 pt-0.5">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}

              {/* GPS link — uses exact coords if available, city name as fallback */}
              {(helpedRequest.latitude && helpedRequest.longitude) ? (
                <a
                  href={`https://maps.google.com/?q=${helpedRequest.latitude},${helpedRequest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-400 font-semibold hover:underline pt-1"
                >
                  <Navigation size={14} />
                  Open GPS Location in Maps
                  <ExternalLink size={12} />
                </a>
              ) : helpedRequest.city ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(helpedRequest.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 font-semibold hover:underline pt-1"
                >
                  <MapPin size={14} />
                  Open Location in Maps
                  <ExternalLink size={12} />
                </a>
              ) : null}
            </div>

            {/* My volunteer details reminder */}
            {myProfile && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-5">
                <p className="text-xs text-rq-muted mb-2 font-semibold uppercase tracking-wide">Your Contact Info (shared with requester)</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-rq-muted">Name</span>
                  <span className="font-medium">{myProfile.volunteerName || myProfile.contactName || "—"}</span>
                  <span className="text-rq-muted">Phone</span>
                  <span className="font-medium">{myProfile.contactPhone || "—"}</span>
                  <span className="text-rq-muted">Services</span>
                  <span className="font-medium">{myProfile.services || "—"}</span>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={() => setHelpedRequest(null)}>
              Done
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function RegField({ label, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">
        {label} {required && <span className="text-rq-red">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rq-red"
      />
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-rq-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
