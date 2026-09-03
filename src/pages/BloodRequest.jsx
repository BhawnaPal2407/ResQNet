/**
 * BloodRequest.jsx
 * ---------------------------------------------------------------------
 * POST /api/blood-requests
 * Required fields: bloodGroup, urgency, city, units
 * Optional fields: hospitalName, patientName, contactNumber, notes
 *
 * urgency enum: LOW | MEDIUM | HIGH | CRITICAL
 * On success → redirects to /tracking/:id
 * ---------------------------------------------------------------------
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Droplet, MapPin, Phone, User, Building2, Star } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { createBloodRequest } from "../api/emergencies.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_LEVELS = [
  { value: "LOW",      label: "Low",      color: "border-green-500  bg-green-500/10  text-green-400" },
  { value: "MEDIUM",   label: "Medium",   color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { value: "HIGH",     label: "High",     color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { value: "CRITICAL", label: "Critical", color: "border-rq-red     bg-rq-red/10     text-rq-red" },
];

export default function BloodRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill blood group if coming from a donor's "Request" button
  const prefillBG = searchParams.get("bloodGroup") || "O+";

  const [form, setForm] = useState({
    bloodGroup: BLOOD_GROUPS.includes(prefillBG) ? prefillBG : "O+",
    urgency: "HIGH",
    city: "",
    units: "",
    hospitalName: "",
    patientName: "",
    contactNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        bloodGroup:    form.bloodGroup,
        urgency:       form.urgency,
        city:          form.city,
        units:         Number(form.units),
        ...(form.hospitalName   && { hospitalName:   form.hospitalName }),
        ...(form.patientName    && { patientName:    form.patientName }),
        ...(form.contactNumber  && { contactNumber:  form.contactNumber }),
      };
      const created = await createBloodRequest(payload);
      navigate(`/tracking/blood/${created.id}`);
    } catch (err) {
      console.error("Blood request error:", err.response?.data);
      const d = err.response?.data;
      let msg = "Failed to submit request. Please try again.";
      if (typeof d === "string")  msg = d;
      else if (d?.message)        msg = d.message;
      else if (d?.errors)         msg = Object.values(d.errors).join(", ");
      else if (!err.response)     msg = "Cannot reach the server. Make sure the backend is running.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-xl font-bold mb-1">Request Blood</h1>
        <p className="text-sm text-rq-muted mb-8">
          Fill in the details and we'll notify nearby donors immediately.
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-rq-panel border border-rq-border rounded-xl p-6 space-y-6"
        >
          {/* Blood Group */}
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

          {/* Urgency */}
          <div>
            <label className="text-xs text-rq-muted mb-2 block">
              Urgency Level <span className="text-rq-red">*</span>
            </label>
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

          {/* City + Units */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City *"
              name="city"
              icon={MapPin}
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Delhi"
              required
            />
            <Field
              label="Units Required *"
              name="units"
              icon={Droplet}
              value={form.units}
              onChange={handleChange}
              placeholder="e.g. 2"
              type="number"
              required
            />
          </div>

          {/* Hospital + Patient */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Hospital Name"
              name="hospitalName"
              icon={Building2}
              value={form.hospitalName}
              onChange={handleChange}
              placeholder="AIIMS Hospital"
            />
            <Field
              label="Patient Name"
              name="patientName"
              icon={User}
              value={form.patientName}
              onChange={handleChange}
              placeholder="Patient's name"
            />
          </div>

          {/* Contact */}
          <Field
            label="Contact Number"
            name="contactNumber"
            icon={Phone}
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />

          <Button type="submit" icon={Star} className="w-full" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Blood Request"}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, name, icon: Icon, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">{label}</label>
      <div className="flex items-center gap-2 bg-rq-bg border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
        {Icon && <Icon size={16} className="text-rq-muted" />}
        <input
          name={name}
          type={type}
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
