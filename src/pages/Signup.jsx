/**
 * Signup.jsx
 * ---------------------------------------------------------------------
 * Create Account screen — calls POST /api/auth/register, stores JWT
 * via AuthContext, then redirects to /home.
 * Role is mapped: donor → DONOR, volunteer → VOLUNTEER, hospital → HOSPITAL
 * ---------------------------------------------------------------------
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  UserPlus,
  Users,
  Building2,
} from "lucide-react";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { registerUser } from "../api/auth.js";
import resqnetLogo from "../assets/logo/ResQNet Logo.png";
import drop from "../assets/images/drop.png";

const ROLES = [
  { key: "DONOR", icon: Droplet, title: "Blood Donor", desc: "Donate blood and save lives" },
  { key: "VOLUNTEER", icon: Users, title: "Volunteer", desc: "Help people in emergencies" },
  { key: "HOSPITAL", icon: Building2, title: "Healthcare Professional", desc: "Join as medical staff" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function Signup() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [role, setRole] = useState("DONOR");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    city: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.fullName,   // backend expects "name" not "fullName"
        phone: form.phone,
        email: form.email,
        password: form.password,
        bloodGroup: form.bloodGroup || null,
        city: form.city,
        role,
      };
      const data = await registerUser(payload);
      authLogin(data);
      navigate("/home", { replace: true });
    } catch (err) {
      // Log the full error so we can see exactly what the backend returned
      console.error("Registration error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);

      // Extract the most useful message from the response
      const responseData = err.response?.data;
      let message = "Registration failed. Please try again.";

      if (typeof responseData === "string" && responseData.length < 300) {
        message = responseData;
      } else if (responseData?.message) {
        message = responseData.message;
      } else if (responseData?.error) {
        message = responseData.error;
      } else if (responseData?.errors) {
        // Spring validation errors come as an object of field → message
        message = Object.values(responseData.errors).join(", ");
      } else if (!err.response) {
        message = "Cannot reach the server. Make sure the backend is running on http://localhost:8080";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-rq-bg text-rq-text">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between p-12 border-r border-rq-border relative overflow-hidden bg-rq-panel">
        <img
          src={drop}
          alt="Blood drop illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-black/70" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={resqnetLogo}
              alt="ResQNet logo"
              className="h-11 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative z-10 flex items-center justify-center flex-1">
          <div className="w-full h-full min-h-[16rem]" />
        </div>

        <div className="relative z-10">
          <p className="text-rq-red text-xs font-semibold mb-2">TOGETHER,</p>
          <h2 className="text-3xl font-bold mb-3">
            We Can Save <span className="text-rq-red">More Lives.</span>
          </h2>
          <p className="text-sm text-rq-muted max-w-sm">
            Join thousands of donors and volunteers making a real difference
            every day.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col justify-center px-6 md:px-16 py-16 max-w-xl mx-auto w-full bg-gradient-to-r from-transparent via-red-500/5 to-red-500/10">
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-red-500/10 to-transparent" />
        <p className="text-rq-red text-xs font-semibold mb-2">CREATE ACCOUNT</p>
        <h1 className="text-2xl font-bold mb-2">Join ResQNet</h1>
        <p className="text-sm text-rq-muted mb-8">Make an impact. Save lives.</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" name="fullName" icon={User} value={form.fullName} onChange={handleChange} placeholder="Enter your full name" required />
            <Field label="Phone Number" name="phone" icon={Phone} value={form.phone} onChange={handleChange} placeholder="Enter phone number" required />
          </div>

          <Field label="Email Address" name="email" icon={Mail} type="email" value={form.email} onChange={handleChange} placeholder="Enter email address" required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Password" name="password" icon={Lock} type="password" value={form.password} onChange={handleChange} placeholder="Create a password" required />
            <Field label="Confirm Password" name="confirmPassword" icon={Lock} type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-rq-muted mb-1 block">Blood Group</label>
              <div className="flex items-center gap-2 bg-rq-panel border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
                <Droplet size={16} className="text-rq-muted" />
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="bg-transparent outline-none w-full text-sm text-rq-text"
                >
                  <option value="" className="bg-rq-panel">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg} className="bg-rq-panel">{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            <Field label="City" name="city" icon={MapPin} value={form.city} onChange={handleChange} placeholder="Enter your city" required />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs text-rq-muted mb-2 block">I want to join as</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    role === r.key
                      ? "border-rq-red bg-rq-red/10"
                      : "border-rq-border bg-rq-panel hover:border-rq-red/50"
                  }`}
                >
                  <r.icon className="text-rq-red mb-2" size={18} />
                  <p className="text-xs font-semibold">{r.title}</p>
                  <p className="text-[10px] text-rq-muted">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-rq-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-rq-red"
            />
            I agree to the <Link to="#" className="text-rq-red">Terms of Service</Link> and{" "}
            <Link to="#" className="text-rq-red">Privacy Policy</Link>
          </label>

          <Button type="submit" icon={UserPlus} className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-rq-border" />
          <span className="text-xs text-rq-muted">or continue with</span>
          <div className="h-px flex-1 bg-rq-border" />
        </div>

        <div className="space-y-3">
          <button className="w-full border border-rq-border rounded-lg py-3 text-sm hover:border-rq-red flex items-center justify-center gap-3 transition-colors">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.31 0-9.618-3.317-11.287-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>
          <button className="w-full border border-rq-border rounded-lg py-3 text-sm hover:border-rq-red flex items-center justify-center gap-3 transition-colors">
            <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-54.3-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.5 268.5-317.5 99.8 0 182.6 65.8 244.9 65.8 60.1 0 154.3-70.2 270-70.2 43.4 0 159.3 3.9 236.6 148.9zm-198.5-175.5c48.8-58.2 84.2-139.1 84.2-220 0-11-.6-22.1-2.5-31.1-80.6 3.2-176.5 53.6-233.9 123.8-43.8 51.7-86.2 132.5-86.2 214.3 0 12.3 1.9 24.7 2.5 28.6 5.1.6 13.3 1.9 21.5 1.9 72.3 0 159.3-48.2 214.4-117.5z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <p className="text-center text-sm text-rq-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-rq-red font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, icon: Icon, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">{label}</label>
      <div className="flex items-center gap-2 bg-rq-panel border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
        <Icon size={16} className="text-rq-muted" />
        <input
          type={type}
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
