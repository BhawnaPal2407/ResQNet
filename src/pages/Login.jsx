/**
 * Login.jsx
 * ---------------------------------------------------------------------
 * Login screen — calls POST /api/auth/login, stores JWT via AuthContext,
 * then redirects to /home (or the page the user was trying to reach).
 * ---------------------------------------------------------------------
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser } from "../api/auth.js";
import resqnetLogo from "../assets/logo/ResQNet Logo.png";
import login from "../assets/images/login_img.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      authLogin(data);
      // Redirect back to the page the user came from, or home
      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-rq-bg text-rq-text">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-start p-8 border-r border-rq-border relative overflow-hidden bg-rq-panel">
        <img
          src={login}
          alt="Login illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-black/70" />

        <div className="relative z-10 flex flex-col justify-center flex-1 w-full max-w-md mr-auto">
          <div className="absolute top-0 left-0">
            <Link to="/" className="flex items-center justify-start">
              <img
                src={resqnetLogo}
                alt="ResQNet logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="text-left mt-20">
            <p className="text-rq-red text-xs font-semibold mb-2">BE A HERO</p>
            <h2 className="text-3xl font-bold mb-3">
              Your Blood Can Save <span className="text-rq-red">A Life.</span>
            </h2>
            <p className="text-sm text-rq-muted max-w-sm">
              ResQNet connects blood donors, volunteers, hospitals and people
              in need through one intelligent emergency-response network.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col justify-center px-6 md:px-16 py-16 max-w-lg mx-auto w-full bg-gradient-to-r from-transparent via-red-500/5 to-red-500/10">
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-red-500/10 to-transparent" />
        <p className="text-rq-red text-xs font-semibold mb-2">WELCOME BACK!</p>
        <h1 className="text-2xl font-bold mb-2">Login to your</h1>
        <h3 className="text-2xl font-bold mb-2"> ResQNet account</h3>
        <p className="text-sm text-rq-muted mb-8">
          Glad to see you again. Let's continue saving lives together.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-rq-muted mb-1 block">
              Email or Phone Number
            </label>
            <div className="flex items-center gap-2 bg-rq-panel border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
              <Mail size={16} className="text-rq-muted" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email or phone number"
                className="bg-transparent outline-none w-full text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-rq-muted mb-1 block">Password</label>
            <div className="flex items-center gap-2 bg-rq-panel border border-rq-border rounded-lg px-4 py-3 focus-within:border-rq-red">
              <Lock size={16} className="text-rq-muted" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="bg-transparent outline-none w-full text-sm"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} className="text-rq-muted" />
                ) : (
                  <Eye size={16} className="text-rq-muted" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-rq-muted">
              <input type="checkbox" className="accent-rq-red" /> Remember me
            </label>
            <Link to="#" className="text-rq-red">Forgot Password?</Link>
          </div>

          <Button
            type="submit"
            icon={ArrowRight}
            iconPosition="left"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-rq-border" />
          <span className="text-xs text-rq-muted">or continue with</span>
          <div className="h-px flex-1 bg-rq-border" />
        </div>

        <div className="space-y-3">
          <button className="w-full border border-rq-border rounded-lg py-3 text-sm hover:border-rq-red flex items-center justify-center gap-3 transition-colors">
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.31 0-9.618-3.317-11.287-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>
          <button className="w-full border border-rq-border rounded-lg py-3 text-sm hover:border-rq-red flex items-center justify-center gap-3 transition-colors">
            {/* Apple icon */}
            <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-54.3-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.5 268.5-317.5 99.8 0 182.6 65.8 244.9 65.8 60.1 0 154.3-70.2 270-70.2 43.4 0 159.3 3.9 236.6 148.9zm-198.5-175.5c48.8-58.2 84.2-139.1 84.2-220 0-11-.6-22.1-2.5-31.1-80.6 3.2-176.5 53.6-233.9 123.8-43.8 51.7-86.2 132.5-86.2 214.3 0 12.3 1.9 24.7 2.5 28.6 5.1.6 13.3 1.9 21.5 1.9 72.3 0 159.3-48.2 214.4-117.5z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <p className="text-center text-sm text-rq-muted mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-rq-red font-medium">Sign Up</Link>
        </p>

        <p className="flex items-center justify-center gap-2 text-xs text-rq-muted mt-8">
          <ShieldCheck size={14} /> Your data is safe and secure with us.
        </p>
      </div>
    </div>
  );
}
