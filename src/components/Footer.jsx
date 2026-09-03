/**
 * Footer.jsx
 * ---------------------------------------------------------------------
 * Site-wide footer: brand blurb, quick links, resources, contact info
 * and app store badges — matches the bottom of the Landing/Home mockups.
 * ---------------------------------------------------------------------
 */
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import resqnetLogo from "../assets/logo/ResQNet Logo.png";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Blood Donation", to: "/blood-donors" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const RESOURCES = [
  { label: "Blog", to: "#" },
  { label: "FAQs", to: "#" },
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-rq-bg border-t border-rq-border pt-14 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <img
              src={resqnetLogo}
              alt="ResQNet logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-rq-muted leading-relaxed">
            ResQNet is a technology-driven platform connecting blood donors,
            volunteers, hospitals and people in need, in real-time.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-rq-muted">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-rq-red">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-rq-muted">
            {RESOURCES.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-rq-red">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-rq-muted">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-rq-red" /> +91 121-1231034
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-rq-red" /> hello@resqnet.org
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-rq-red" /> Delhi, India
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-full border border-rq-border flex items-center justify-center hover:border-rq-red hover:text-rq-red"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="rq-divider max-w-7xl mx-auto my-8" />

      <p className="text-center text-xs text-rq-muted">
        © {new Date().getFullYear()} ResQNet. All rights reserved.
      </p>
    </footer>
  );
}
