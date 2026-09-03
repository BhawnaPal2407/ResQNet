/**
 * LiveMap.jsx
 * ---------------------------------------------------------------------
 * Real-time map view of emergencies, donors, volunteers and hospitals.
 *
 * NOTE: This is a stylized placeholder (a dark grid + positioned pins)
 * so the UI matches your mockup without needing an API key. To go
 * live, swap the <div className="map-surface"> block for a real map,
 * e.g. Google Maps (@react-google-maps/api) or Mapbox GL, and map
 * MARKERS below to real markers/pins on that map.
 * ---------------------------------------------------------------------
 */
import { useState } from "react";
import { Droplet, Users, Building2, Siren, Plus, Minus } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";

const FILTERS = ["All", "Blood Donors", "Volunteers", "Hospitals", "Emergencies"];

// Positions are just percentages within the map surface (top/left)
const MARKERS = [
  { id: 1, type: "emergency", top: "62%", left: "48%", icon: Siren },
  { id: 2, type: "donor", top: "30%", left: "35%", icon: Droplet },
  { id: 3, type: "donor", top: "20%", left: "70%", icon: Droplet },
  { id: 4, type: "volunteer", top: "45%", left: "18%", icon: Users },
  { id: 5, type: "volunteer", top: "70%", left: "78%", icon: Users },
  { id: 6, type: "hospital", top: "18%", left: "20%", icon: Building2 },
  { id: 7, type: "hospital", top: "78%", left: "30%", icon: Building2 },
];

const MARKER_COLOR = {
  emergency: "bg-rq-red border-rq-red",
  donor: "bg-green-500 border-green-500",
  volunteer: "bg-blue-500 border-blue-500",
  hospital: "bg-white border-white",
};

export default function LiveMap() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(MARKERS[0]);

  const visibleMarkers =
    filter === "All"
      ? MARKERS
      : MARKERS.filter((m) => {
          const map = { "Blood Donors": "donor", Volunteers: "volunteer", Hospitals: "hospital", Emergencies: "emergency" };
          return m.type === map[filter];
        });

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar loggedIn />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-xl font-bold mb-1">Live Map</h1>
        <p className="text-sm text-rq-muted mb-6">
          Real-time view of emergencies, donors, volunteers and hospitals near you.
        </p>

        {/* Filters + legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs border ${
                  filter === f
                    ? "bg-rq-red border-rq-red text-white"
                    : "border-rq-border text-rq-muted hover:border-rq-red/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-rq-muted">
            <Legend color="bg-rq-red" label="Emergency" />
            <Legend color="bg-green-500" label="Blood Donor" />
            <Legend color="bg-blue-500" label="Volunteer" />
            <Legend color="bg-white" label="Hospital" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map surface */}
          <div className="lg:col-span-2 relative h-[480px] rounded-xl overflow-hidden border border-rq-border bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#0a0a0a_80%)]">
            {/* faux grid lines */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {visibleMarkers.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                style={{ top: m.top, left: m.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 flex items-center justify-center ${MARKER_COLOR[m.type]} ${
                  m.type === "hospital" ? "text-black" : "text-white"
                } shadow-lg`}
              >
                <m.icon size={16} />
              </button>
            ))}

            {/* zoom controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button className="w-8 h-8 bg-rq-panel border border-rq-border rounded-lg flex items-center justify-center">
                <Plus size={14} />
              </button>
              <button className="w-8 h-8 bg-rq-panel border border-rq-border rounded-lg flex items-center justify-center">
                <Minus size={14} />
              </button>
            </div>
          </div>

          {/* Selected marker detail panel */}
          <div className="bg-rq-panel border border-rq-border rounded-xl p-6 h-fit">
            <span className="text-[10px] uppercase tracking-wide bg-rq-red/15 text-rq-red px-2 py-1 rounded-full">
              {selected.type}
            </span>
            <h3 className="font-semibold mt-3 mb-1">
              {selected.type === "emergency" && "O+ Blood Required"}
              {selected.type === "donor" && "Available Donor"}
              {selected.type === "volunteer" && "Active Volunteer"}
              {selected.type === "hospital" && "Partner Hospital"}
            </h3>
            <p className="text-xs text-rq-muted mb-1">AIIMS Hospital, Delhi</p>
            <p className="text-xs text-rq-muted mb-4">2.4 km away</p>
            <Button className="w-full">View Details</Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {label}
    </span>
  );
}
