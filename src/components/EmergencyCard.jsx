/**
 * EmergencyCard.jsx
 * ---------------------------------------------------------------------
 * A single active emergency request, shown in lists on Home and
 * EmergencyRequest pages ("O+ Blood Required · AIIMS Hospital · 2.4 km").
 *
 * Props:
 *   bloodGroup  - e.g. "O+"
 *   type        - "Blood" | "Platelets" | "Ambulance" | ...
 *   hospital    - hospital name
 *   units       - units required, e.g. "2 Units"
 *   distance    - e.g. "2.4 km away"
 *   urgent      - true shows the red "URGENT" tag
 *   onRespond   - click handler for the Respond Now button
 * ---------------------------------------------------------------------
 */
import { Droplet, MapPin } from "lucide-react";
import Button from "./Button.jsx";

export default function EmergencyCard({
  bloodGroup = "O+",
  type = "Blood",
  hospital = "AIIMS Hospital, Delhi",
  units = "2 Units",
  distance = "2.4 km away",
  urgent = true,
  onRespond,
}) {
  return (
    <div className="bg-rq-panel border border-rq-border rounded-xl p-5 flex flex-col gap-4 hover:border-rq-red/60 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-rq-red/10 flex items-center justify-center">
            <Droplet className="text-rq-red" size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {bloodGroup} {type} Required
            </p>
            <p className="text-xs text-rq-muted">{hospital}</p>
          </div>
        </div>
        {urgent && (
          <span className="text-[10px] uppercase tracking-wide bg-rq-red/15 text-rq-red px-2 py-1 rounded-full">
            Urgent
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-rq-muted">
        <span>{units}</span>
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {distance}
        </span>
      </div>

      <Button onClick={onRespond} className="w-full">
        Respond Now
      </Button>
    </div>
  );
}
