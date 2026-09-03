/**
 * About.jsx
 * ---------------------------------------------------------------------
 * About Us page — mission, vision, and stats, matching the mockup.
 * ---------------------------------------------------------------------
 */
import { Droplet, Target, Eye } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const STATS = [
  { value: "12K+", label: "Donors" },
  { value: "3K+", label: "Volunteers" },
  { value: "500+", label: "Hospitals" },
  { value: "50K+", label: "Lives Impacted" },
];

export default function About() {
  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-rq-red text-xs font-semibold mb-2">ABOUT US</p>
        <h1 className="text-3xl font-bold mb-4">One Network. Every Emergency.</h1>
        <p className="text-rq-muted max-w-2xl mb-10 leading-relaxed">
          ResQNet is a technology-driven platform connecting blood donors,
          volunteers, hospitals and people in need. Our mission is to
          ensure timely help and resources reach everyone, everywhere.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="bg-rq-panel border border-rq-border rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-rq-red">{s.value}</p>
              <p className="text-xs text-rq-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-rq-panel border border-rq-border rounded-xl p-8">
            <Target className="text-rq-red mb-4" size={26} />
            <h2 className="font-semibold mb-2">Our Mission</h2>
            <p className="text-sm text-rq-muted leading-relaxed">
              To build the world's most reliable emergency-response network
              and ensure timely help or resources.
            </p>
          </div>
          <div className="bg-rq-panel border border-rq-border rounded-xl p-8">
            <Eye className="text-rq-red mb-4" size={26} />
            <h2 className="font-semibold mb-2">Our Vision</h2>
            <p className="text-sm text-rq-muted leading-relaxed">
              A world where no one suffers for lack of timely help or resources.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-16 text-rq-muted text-xs">
          <Droplet className="text-rq-red" size={16} /> Built with care, for every emergency.
        </div>
      </div>

      <Footer />
    </div>
  );
}
