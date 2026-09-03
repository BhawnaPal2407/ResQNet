/**
 * Landing.jsx
 * ---------------------------------------------------------------------
 * The public marketing homepage (matches your "TOGETHER, WE CAN SAVE
 * LIVES" mockup): hero, how it works, network diagram, volunteer CTA,
 * live coverage teaser, and final CTA banner.
 * ---------------------------------------------------------------------
 */
import { Link } from "react-router-dom";
import {
  Droplet,
  Users,
  Heart,
  Building2,
  Siren,
  MapPin,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import heroImage from "../assets/images/Savior.png";
import bgRedNetwork from "../assets/backgrounds/bg_red_network.jpg";
import network from "../assets/images/network.png";
import volunteer from "../assets/images/voulnteer.png";
import map from "../assets/images/map.png";
import bottom from "../assets/images/bottom.png";
import resqnetLogo from "../assets/logo/ResQNet Logo.png";


const STATS = [
  { icon: Droplet, value: "12,482", label: "Blood Donors" },
  { icon: Users, value: "3,240", label: "Volunteers" },
  { icon: Heart, value: "8,921", label: "Lives Helped" },
];

const NETWORK_NODES = [
  { icon: Droplet, label: "Blood Donors", position: "top-left" },
  { icon: Users, label: "Volunteers", position: "top-right" },
  { icon: Building2, label: "Hospitals", position: "bottom-left" },
  { icon: Siren, label: "Emergency Requests", position: "bottom-right" },
];

export default function Landing() {
  return (
    <div className="bg-black-800 text-white">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section
        className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center overflow-hidden rounded-[2rem] my-6 border border-rq-border/60"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 11, 17, 0.4), rgba(11, 11, 17, 0.5)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl pb-12 font-extrabold leading-tight mb-5">
            TOGETHER, <br /> WE CAN <span className="text-rq-red">SAVE LIVES</span>
          </h1>
          <p className="text-rq-muted mb-8 max-w-md">
            ResQNet connects blood donors, volunteers, hospitals and people
            in need through one intelligent emergency-response network.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Button as="link" to="/emergency-request" icon={Droplet}>
              Request Help Now
            </Button>
            <Button as="link" to="/signup" variant="outline" icon={Users}>
              Become a Donor
            </Button>
          </div>

          <div className="flex flex-wrap gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div>
                  <p className="font-bold text-lg leading-none">{s.value}</p>
                  <p className="text-xs text-rq-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero art: photo-based right-side visual with subtle blending */}
        <div className="relative z-10 flex items-center justify-center h-[24rem] md:h-[36rem]">
      
          <div className="absolute inset-4 rounded-[2.5rem] bg-[radial-gradient(circle,_rgba(220,38,38,0.42),transparent_60%)] blur-3xl" />

          <div className="absolute inset-x-16 bottom-0 h-24 rounded-full bg-red-600/25 blur-3xl" />

          <div className="relative z-10 w-full max-w-[34rem]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-red-500/15 via-transparent to-transparent blur-2xl" />

          </div>
        </div>
      </section>

      {/* ---------------- Network diagram ---------------- */}
      <section className="bg-rq-panel/40 border-y border-rq-border py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
       
          <div>
            <p className="text-rq-red text-xs font-semibold mb-2">THE RESQNET NETWORK</p>
            <h2 className="text-3xl font-bold mb-4">
              Stronger Together, <span className="text-rq-red">Saving More Lives.</span>
            </h2>
            <p className="text-rq-muted mb-6 max-w-md">
              ResQNet brings together donors, volunteers, hospitals and
              communities on one platform to ensure help reaches everyone,
              everywhere.
            </p>
            <Button as="link" to="/about">Explore the Network</Button>
          </div>

          <div className="relative h-[26 rem] md:h-[19rem] w-full overflow-hidden rounded-[2rem] border border-rq-border/60 bg-rq-panel/30">
            <img
              src={network}
              alt="ResQNet network"
              className="absolute inset-0 h-auto w-auto object-cover opacity-95 contrast-110 saturate-125 drop-shadow-[0_0_32px_rgba(239,68,68,0.2)]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-rq-red/10" />
          </div>
        </div>
      </section>

      {/* ---------------- Volunteer CTA ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 11, 17, 0.4), rgba(11, 11, 17, 0.4)), url(${volunteer})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="grid md:grid-cols-2 items-stretch overflow-hidden rounded-[2rem] border border-rq-border/60 bg-rq-panel/30">
          <div className="relative min-h-[18rem] md:min-h-full">
            <img
              src={volunteer}
              alt="Volunteer support"
              className="absolute inset-0 h-full w-full object-cover scale-[0.96] opacity-90 contrast-110 saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
          </div>

          <div className="flex items-center p-8 md:p-12">
            <div>
              <p className="text-rq-red text-xs font-semibold mb-2">BE A HERO</p>
              <h2 className="text-3xl font-bold mb-4">
                Your Time Can <span className="text-rq-red">Save a Life.</span>
              </h2>
              <p className="text-rq-muted mb-6 max-w-md">
                Join thousands of volunteers who step forward during emergencies
                and make a real difference.
              </p>
              <Button as="link" to="/volunteers" variant="outline" icon={Users}>
                Become a Volunteer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Live coverage teaser ---------------- */}
      <section className="bg-rq-panel/40 border-y border-rq-border py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <p className="text-rq-red text-xs font-semibold mb-2">REAL-TIME COVERAGE</p>
            <h2 className="text-3xl font-bold mb-4">Help Is Closer Than You Think.</h2>
            <p className="text-rq-muted mb-6 max-w-md">
              Our real-time network shows emergency requests, nearby donors,
              volunteers and hospitals — all in one view.
            </p>
            <Button as="link" to="/live-map" variant="outline" icon={MapPin}>
              View Live Map
            </Button>
          </div>

          <div className="relative h-[18rem] md:h-[22rem] w-full overflow-hidden rounded-[2rem] border border-rq-border/60 bg-rq-panel/30 shadow-[0_0_30px_rgba(239,68,68,0.12)]">
            <img
              src={map}
              alt="Live map coverage"
              className="absolute inset-0 h-full w-full object-cover opacity-95 contrast-110 saturate-125 scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-red-500/10" />
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center"
      style={{
        backgroundImage : `linear-gradient(rgba(11, 11, 17, 0.4), rgba(11, 11, 17, 0.4)), url(${bottom})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      >
        <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-6">
          ONE DONATION. <br/>ONE VOLUNTEER. <br/>
          ONE CONNECTION.<br/> ONE MORE LIFE. </h2>

        <div className="flex justify-center mb-6">
          <img
            src={resqnetLogo}
            alt="ResQNet logo"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>

        <Button as="link" to="/signup" icon={Heart}>
          Get Started Today
        </Button>
      </section>

      <Footer />
    </div>
  );
}
