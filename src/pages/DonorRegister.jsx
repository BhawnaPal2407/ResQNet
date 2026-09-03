/**
 * DonorRegister.jsx
 * ---------------------------------------------------------------------
 * Register as a blood donor via POST /api/blood-donors/register
 *
 * If the user is already registered, shows their donor profile card
 * with a toggle availability button — no double-registration possible.
 *
 * Required fields (from BloodDonorDTO):
 *   bloodGroup, city
 * Optional:
 *   phone, dateOfBirth, available (default true)
 * ---------------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import { Droplet, MapPin, Phone, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMyDonorProfile,
  registerAsDonor,
  toggleDonorAvailability,
} from "../api/donors.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function DonorRegister() {
  const { user } = useAuth();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [donorProfile, setDonorProfile]     = useState(null);  // null = not registered
  const [toggling, setToggling]             = useState(false);

  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || "O+",
    city:       user?.city || "",
    phone:      "",
    dateOfBirth: "",
    available:  true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // On mount — check if already a donor
  useEffect(() => {
    getMyDonorProfile()
      .then((profile) => setDonorProfile(profile))
      .catch(() => setDonorProfile(null))   // 404 = not registered yet
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        bloodGroup: form.bloodGroup,
        city:       form.city,
        available:  form.available,
        ...(form.phone       && { phone:       form.phone }),
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
      };
      const profile = await registerAsDonor(payload);
      setDonorProfile(profile);
    } catch (err) {
      const d = err.response?.data;
      let msg = "Registration failed. Please try again.";
      if (typeof d === "string")  msg = d;
      else if (d?.message)        msg = d.message;
      else if (d?.errors)         msg = Object.values(d.errors).join(", ");
      else if (!err.response)     msg = "Cannot reach the server.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await toggleDonorAvailability();
      setDonorProfile(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="bg-rq-bg text-rq-text min-h-screen">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center text-sm text-rq-muted">
          Checking donor status…
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">

        {/* ── Already a donor ── */}
        {donorProfile ? (
          <div className="bg-rq-panel border border-rq-border rounded-2xl p-8 text-center">
            <CheckCircle2 className="text-green-400 mx-auto mb-4" size={48} />
            <h1 className="text-xl font-bold mb-1">You're a Registered Donor!</h1>
            <p className="text-sm text-rq-muted mb-6">
              Your donor profile is active. Thank you for being part of ResQNet.
            </p>

            {/* Profile summary */}
            <div className="grid grid-cols-2 gap-4 text-left mb-8">
              <InfoField label="Blood Group"    value={donorProfile.bloodGroup || "—"} />
              <InfoField label="City"           value={donorProfile.city || "—"} />
              <InfoField label="Last Donation"  value={donorProfile.lastDonationDate || "Never"} />
              <InfoField label="Status"
                value={donorProfile.available ? "Available" : "Unavailable"}
                valueClass={donorProfile.available ? "text-green-400" : "text-rq-muted"}
              />
            </div>

            {/* Toggle availability */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className="flex items-center justify-center gap-3 w-full border border-rq-border rounded-xl py-4 hover:border-rq-red transition-colors text-sm font-semibold"
            >
              {donorProfile.available
                ? <ToggleRight className="text-green-400" size={24} />
                : <ToggleLeft  className="text-rq-muted"   size={24} />}
              {toggling ? "Updating…"
                : donorProfile.available
                ? "Mark as Unavailable"
                : "Mark as Available"}
            </button>
          </div>
        ) : (
          /* ── Registration form ── */
          <>
            <h1 className="text-xl font-bold mb-1">Register as Blood Donor</h1>
            <p className="text-sm text-rq-muted mb-8">
              Join our network and save lives by donating blood when needed.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-rq-panel border border-rq-border rounded-2xl p-6 space-y-6"
            >
              {/* Blood group */}
              <div>
                <label className="text-xs text-rq-muted mb-2 block">
                  Blood Group <span className="text-rq-red">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setForm({ ...form, bloodGroup: bg })}
                      className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                        form.bloodGroup === bg
                          ? "bg-rq-red border-rq-red text-white"
                          : "border-rq-border text-rq-muted hover:border-rq-red/50"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <Field label="City *" name="city" icon={MapPin} value={form.city}
                onChange={handleChange} placeholder="e.g. Delhi" required />

              {/* Phone */}
              <Field label="Phone Number" name="phone" icon={Phone} value={form.phone}
                onChange={handleChange} placeholder="+91 98765 43210" />

              {/* DOB */}
              <div>
                <label className="text-xs text-rq-muted mb-1 block">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-3 text-sm outline-none focus:border-rq-red"
                />
              </div>

              {/* Available */}
              <label className="flex items-center gap-3 text-sm text-rq-muted cursor-pointer">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  className="accent-rq-red"
                />
                <Droplet size={15} className="text-rq-red" />
                I am currently available to donate
              </label>

              <Button type="submit" icon={Droplet} className="w-full" disabled={submitting}>
                {submitting ? "Registering…" : "Register as Donor"}
              </Button>
            </form>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, name, icon: Icon, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">{label}</label>
      <div className="flex items-center gap-2 bg-rq-bg border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
        {Icon && <Icon size={16} className="text-rq-muted" />}
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
    </div>
  );
}

function InfoField({ label, value, valueClass = "" }) {
  return (
    <div className="bg-rq-bg border border-rq-border rounded-lg p-4">
      <p className="text-xs text-rq-muted mb-1">{label}</p>
      <p className={`font-semibold text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}
