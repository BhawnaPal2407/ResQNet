/**
 * BloodCard.jsx
 * ---------------------------------------------------------------------
 * A single donor row on the BloodDonors "Find Blood" tab.
 *
 * - Shows the donor's profile picture from localStorage (rq_profile_{userId})
 *   if they have uploaded one, otherwise shows their initial.
 * - "Request" button navigates to /blood-request pre-filled with the
 *   donor's blood group so the requester doesn't have to pick it again.
 *
 * Props:
 *   userId      - donor's userId (used to look up their saved avatar)
 *   name        - donor's display name
 *   bloodGroup  - e.g. "O+"
 *   distance    - e.g. "2.1 km away"
 *   lastDonated - e.g. "12 May 2024"
 *   available   - true | false
 *   onRequest   - optional custom click handler (overrides default navigation)
 * ---------------------------------------------------------------------
 */
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";

function getAvatarForUser(userId) {
  if (!userId) return null;
  try {
    const lp = JSON.parse(localStorage.getItem(`rq_profile_${userId}`));
    return lp?.avatar || null;
  } catch { return null; }
}

export default function BloodCard({
  userId,
  name = "",
  bloodGroup = "",
  distance = "—",
  lastDonated = "—",
  available = true,
  onRequest,
}) {
  const navigate = useNavigate();

  if (!name && !bloodGroup) return null;

  const avatar = getAvatarForUser(userId);

  const handleRequest = () => {
    if (onRequest) { onRequest(); return; }
    navigate(`/blood-request?bloodGroup=${encodeURIComponent(bloodGroup)}`);
  };

  return (
    <div className="flex items-center justify-between bg-rq-panel border border-rq-border rounded-xl p-4 hover:border-rq-red/50 transition-colors">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-rq-red/15 border border-rq-border overflow-hidden flex items-center justify-center font-semibold text-rq-red flex-shrink-0">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <span>{name.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-rq-muted">Last donated: {lastDonated}</p>
        </div>
      </div>

      {/* Right: meta + button */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-rq-muted flex items-center gap-1">
          <MapPin size={13} /> {distance}
        </span>
        <span className="text-sm font-bold text-rq-red">{bloodGroup}</span>
        <span className={`text-[10px] px-2 py-1 rounded-full ${
          available ? "bg-green-500/15 text-green-400" : "bg-rq-muted/15 text-rq-muted"
        }`}>
          {available ? "Available" : "Unavailable"}
        </span>
        <Button
          variant="outline"
          className="px-4 py-2 text-xs"
          disabled={!available}
          onClick={handleRequest}
        >
          Request
        </Button>
      </div>
    </div>
  );
}
