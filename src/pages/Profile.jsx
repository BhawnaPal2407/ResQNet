/**
 * Profile.jsx
 * ---------------------------------------------------------------------
 * Full profile page with:
 *  - Profile picture upload (stored as base64 in localStorage)
 *  - Inline edit for name, phone, city (stored in localStorage,
 *    shown alongside JWT data since backend has no /users/me endpoint)
 *  - Blood info tab (donor profile from API)
 *  - Donation / request history tab
 *  - Toggle donor availability
 * ---------------------------------------------------------------------
 */
import { useState, useEffect, useRef } from "react";
import {
  User, Droplet, History, Phone, Bell, Shield,
  Settings as SettingsIcon, Camera, Pencil, Check, X,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyDonorProfile, toggleDonorAvailability } from "../api/donors.js";
import { getMyVolunteerProfile } from "../api/volunteers.js";
import { getMyBloodRequests, getMyEmergencyRequests } from "../api/emergencies.js";

const TABS = [
  { key: "personal",      label: "Personal Info",     icon: User },
  { key: "blood",         label: "Blood Info",         icon: Droplet },
  { key: "history",       label: "My Requests",        icon: History },
  { key: "contacts",      label: "Emergency Contacts", icon: Phone },
  { key: "notifications", label: "Notifications",      icon: Bell },
  { key: "security",      label: "Security",           icon: Shield },
  { key: "settings",      label: "Settings",           icon: SettingsIcon },
];

const STATUS_COLOR = {
  COMPLETED:           "bg-green-500/15 text-green-400",
  RESOLVED:            "bg-green-500/15 text-green-400",
  CANCELLED:           "bg-rq-muted/15 text-rq-muted",
  EXPIRED:             "bg-rq-muted/15 text-rq-muted",
  OPEN:                "bg-rq-red/15 text-rq-red",
  MATCHING:            "bg-orange-500/15 text-orange-400",
  DONOR_NOTIFIED:      "bg-yellow-500/15 text-yellow-400",
  DONOR_ACCEPTED:      "bg-blue-500/15 text-blue-400",
  DONATION_IN_PROGRESS:"bg-blue-500/15 text-blue-400",
  IN_PROGRESS:         "bg-blue-500/15 text-blue-400",
};

/** Read/write local profile overrides (name, phone, city, avatar) */
const LS_KEY = (userId) => `rq_profile_${userId}`;

function loadLocalProfile(userId) {
  try { return JSON.parse(localStorage.getItem(LS_KEY(userId))) || {}; }
  catch { return {}; }
}
function saveLocalProfile(userId, data) {
  localStorage.setItem(LS_KEY(userId), JSON.stringify(data));
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  /* ── Local overrides (avatar + editable fields) ── */
  const [localProfile, setLocalProfile] = useState({});
  const fileInputRef = useRef(null);

  /* ── Edit mode ── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  /* ── API data ── */
  const [donorProfile,     setDonorProfile]     = useState(null);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [bloodRequests,    setBloodRequests]    = useState([]);
  const [emergencyRequests,setEmergencyRequests]= useState([]);
  const [toggling,         setToggling]         = useState(false);

  /* Load local profile on mount */
  useEffect(() => {
    if (!user) return;
    const lp = loadLocalProfile(user.userId);
    setLocalProfile(lp);
    setEditForm({
      name:  lp.name  || user.name  || "",
      phone: lp.phone || "",
      city:  lp.city  || "",
    });
  }, [user]);

  /* Load API data */
  useEffect(() => {
    if (!user) return;
    if (user.role === "DONOR")     getMyDonorProfile().then(setDonorProfile).catch(console.error);
    if (user.role === "VOLUNTEER") getMyVolunteerProfile().then(setVolunteerProfile).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (activeTab !== "history") return;
    getMyBloodRequests()
      .then((d) => setBloodRequests(Array.isArray(d) ? d : d?.content ?? []))
      .catch(console.error);
    getMyEmergencyRequests()
      .then((d) => setEmergencyRequests(Array.isArray(d) ? d : d?.content ?? []))
      .catch(console.error);
  }, [activeTab]);

  if (!user) return null;

  /* Merged display values */
  const displayName   = localProfile.name  || user.name  || "User";
  const displayPhone  = localProfile.phone || "—";
  const displayCity   = localProfile.city  || "—";
  const avatarSrc     = localProfile.avatar || null;

  /* ── Avatar upload ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updated = { ...localProfile, avatar: ev.target.result };
      setLocalProfile(updated);
      saveLocalProfile(user.userId, updated);
    };
    reader.readAsDataURL(file);
  };

  /* ── Save edit ── */
  const handleSaveEdit = () => {
    const updated = {
      ...localProfile,
      name:  editForm.name.trim()  || localProfile.name,
      phone: editForm.phone.trim() || localProfile.phone,
      city:  editForm.city.trim()  || localProfile.city,
    };
    setLocalProfile(updated);
    saveLocalProfile(user.userId, updated);
    setEditing(false);
  };

  /* ── Toggle donor availability ── */
  const handleToggle = async () => {
    setToggling(true);
    try { setDonorProfile(await toggleDonorAvailability()); }
    catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Profile header ── */}
        <div className="flex items-center gap-6 mb-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-rq-red/15 border-2 border-rq-border overflow-hidden flex items-center justify-center">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-rq-red">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change photo"
            >
              <Camera size={22} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name + meta */}
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-sm text-rq-muted">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] px-3 py-1 rounded-full bg-rq-red/15 text-rq-red font-semibold uppercase tracking-wide">
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar tabs */}
          <div className="bg-rq-panel border border-rq-border rounded-xl p-3 h-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left transition-colors ${
                  activeTab === tab.key
                    ? "bg-rq-red/15 text-rq-red"
                    : "text-rq-muted hover:bg-rq-bg"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-rq-panel border border-rq-border rounded-xl p-8">

            {/* ── Personal Info ── */}
            {activeTab === "personal" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold">Personal Information</h2>
                  {!editing
                    ? <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs text-rq-red hover:underline">
                        <Pencil size={13} /> Edit
                      </button>
                    : <div className="flex gap-2">
                        <button onClick={handleSaveEdit}
                          className="flex items-center gap-1 text-xs text-green-400 hover:underline">
                          <Check size={13} /> Save
                        </button>
                        <button onClick={() => setEditing(false)}
                          className="flex items-center gap-1 text-xs text-rq-muted hover:underline">
                          <X size={13} /> Cancel
                        </button>
                      </div>
                  }
                </div>

                {editing ? (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <EditField label="Full Name"    value={editForm.name}  onChange={(v) => setEditForm({...editForm, name: v})}  />
                    <EditField label="Phone Number" value={editForm.phone} onChange={(v) => setEditForm({...editForm, phone: v})} placeholder="+91 98765 43210" />
                    <EditField label="City"         value={editForm.city}  onChange={(v) => setEditForm({...editForm, city: v})}  placeholder="e.g. Delhi" />
                    <InfoField label="Email (cannot change)" value={user.email || "—"} />
                    <InfoField label="Role"    value={user.role   || "—"} />
                    <InfoField label="User ID" value={`#${user.userId}`} />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <InfoField label="Full Name"   value={displayName} />
                    <InfoField label="Email"       value={user.email || "—"} />
                    <InfoField label="Phone"       value={displayPhone} />
                    <InfoField label="City"        value={displayCity} />
                    <InfoField label="Role"        value={user.role || "—"} />
                    <InfoField label="User ID"     value={`#${user.userId}`} />
                  </div>
                )}

                {/* Avatar change hint */}
                <p className="text-xs text-rq-muted mt-8 flex items-center gap-2">
                  <Camera size={13} />
                  Hover over your profile picture at the top to change it (max 2 MB).
                </p>
              </>
            )}

            {/* ── Blood Info ── */}
            {activeTab === "blood" && (
              <>
                <h2 className="font-semibold mb-6">Blood Information</h2>
                {donorProfile ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-rq-red/15 border border-rq-border flex items-center justify-center">
                        <Droplet className="text-rq-red" size={24} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-rq-red">{donorProfile.bloodGroup || "—"}</p>
                        <p className="text-xs text-rq-muted">Blood Group</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5 mb-8">
                      <InfoField label="City"           value={donorProfile.city || "—"} />
                      <InfoField label="Last Donation"  value={donorProfile.lastDonationDate || "Never donated"} />
                      <InfoField label="Available"
                        value={donorProfile.available ? "Yes — Ready to donate" : "Not available"}
                        valueClass={donorProfile.available ? "text-green-400" : "text-rq-muted"}
                      />
                    </div>

                    {/* Toggle availability */}
                    <button
                      onClick={handleToggle}
                      disabled={toggling}
                      className="flex items-center gap-3 border border-rq-border rounded-xl px-5 py-3 hover:border-rq-red transition-colors text-sm font-semibold"
                    >
                      {donorProfile.available
                        ? <ToggleRight className="text-green-400" size={22} />
                        : <ToggleLeft  className="text-rq-muted"  size={22} />}
                      {toggling ? "Updating…" : donorProfile.available ? "Mark as Unavailable" : "Mark as Available"}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Droplet className="text-rq-muted mx-auto mb-3" size={32} />
                    <p className="text-sm text-rq-muted mb-4">
                      {user.role === "DONOR"
                        ? "Loading your donor profile…"
                        : "You are not registered as a blood donor."}
                    </p>
                    {user.role !== "DONOR" && (
                      <Button as="link" to="/donor-register" icon={Droplet}>Register as Donor</Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── My Requests ── */}
            {activeTab === "history" && (
              <>
                <h2 className="font-semibold mb-6">My Requests</h2>

                {/* Blood requests */}
                <p className="text-xs text-rq-muted font-semibold uppercase tracking-widest mb-3">Blood Requests</p>
                {bloodRequests.length === 0
                  ? <p className="text-sm text-rq-muted mb-6">No blood requests found.</p>
                  : (
                    <div className="space-y-2 mb-8">
                      {bloodRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between border border-rq-border rounded-lg px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{req.bloodGroup} · {req.units} unit(s) · {req.hospitalName || req.city || "—"}</p>
                            <p className="text-xs text-rq-muted">{req.createdAt?.slice(0,10) || "—"}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLOR[req.status] || "bg-rq-muted/10 text-rq-muted"}`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }

                {/* Emergency requests */}
                <p className="text-xs text-rq-muted font-semibold uppercase tracking-widest mb-3">Emergency Requests</p>
                {emergencyRequests.length === 0
                  ? <p className="text-sm text-rq-muted">No emergency requests found.</p>
                  : (
                    <div className="space-y-2">
                      {emergencyRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between border border-rq-border rounded-lg px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{req.category?.replace(/_/g," ")} · {req.city || "—"}</p>
                            <p className="text-xs text-rq-muted">{req.createdAt?.slice(0,10) || "—"}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLOR[req.status] || "bg-rq-muted/10 text-rq-muted"}`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }
              </>
            )}

            {/* ── Emergency Contacts stub ── */}
            {activeTab === "contacts" && (
              <>
                <h2 className="font-semibold mb-2">Emergency Contacts</h2>
                <p className="text-xs text-rq-muted mb-6">People who will be notified during emergencies.</p>
                <Button variant="outline">Manage Contacts</Button>
              </>
            )}

            {/* ── Other stubs ── */}
            {!["personal","blood","history","contacts"].includes(activeTab) && (
              <div className="text-sm text-rq-muted">
                {TABS.find((t) => t.key === activeTab)?.label} — coming soon.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function InfoField({ label, value, valueClass = "" }) {
  return (
    <div>
      <p className="text-xs text-rq-muted mb-1">{label}</p>
      <p className={`font-medium text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rq-red"
      />
    </div>
  );
}
