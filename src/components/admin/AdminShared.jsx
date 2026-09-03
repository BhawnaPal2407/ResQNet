/**
 * AdminShared.jsx
 * Reusable tiny components used across all admin pages.
 */
import { useState } from "react";
import { RefreshCw, Trash2, ChevronDown } from "lucide-react";

export const URGENCY_COLOR = {
  LOW:      "bg-green-500/15 text-green-400",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400",
  HIGH:     "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-rq-red/15 text-rq-red",
};

export const STATUS_COLOR = {
  OPEN:                "bg-sky-500/15 text-sky-400",
  MATCHING:            "bg-yellow-500/15 text-yellow-400",
  DONOR_NOTIFIED:      "bg-orange-500/15 text-orange-400",
  DONOR_ACCEPTED:      "bg-blue-500/15 text-blue-400",
  DONATION_IN_PROGRESS:"bg-purple-500/15 text-purple-400",
  IN_PROGRESS:         "bg-purple-500/15 text-purple-400",
  ASSIGNED:            "bg-blue-500/15 text-blue-400",
  COMPLETED:           "bg-green-500/15 text-green-400",
  RESOLVED:            "bg-green-500/15 text-green-400",
  CANCELLED:           "bg-rq-muted/15 text-rq-muted",
  EXPIRED:             "bg-rq-muted/15 text-rq-muted",
};

export const VERIFY_COLOR = {
  PENDING:  "bg-yellow-500/15 text-yellow-400",
  APPROVED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-rq-red/15 text-rq-red",
  SUSPENDED:"bg-rq-muted/15 text-rq-muted",
};

export function Badge({ text, color }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap ${color || "bg-rq-muted/15 text-rq-muted"}`}>
      {text?.replace(/_/g, " ") || "—"}
    </span>
  );
}

export function PageHeader({ title, subtitle, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-rq-muted mt-0.5">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-rq-muted hover:text-rq-red transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      )}
    </div>
  );
}

export function DeleteButton({ onDelete, label = "Delete" }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-rq-muted">Sure?</span>
        <button onClick={() => { onDelete(); setConfirm(false); }}
          className="text-[10px] text-rq-red font-bold hover:underline">Yes</button>
        <button onClick={() => setConfirm(false)}
          className="text-[10px] text-rq-muted hover:underline">No</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-xs text-rq-muted hover:text-rq-red transition-colors px-2 py-1.5 rounded border border-rq-border hover:border-rq-red">
      <Trash2 size={11} /> {label}
    </button>
  );
}

export function StatusSelect({ current, options, onApply }) {
  const [selected, setSelected] = useState(current);
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="bg-rq-bg border border-rq-border rounded px-2 py-1.5 text-xs outline-none focus:border-rq-red"
      >
        {options.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>
      <button
        onClick={() => onApply(selected)}
        disabled={selected === current}
        className="text-[10px] px-2 py-1.5 rounded bg-rq-red/15 text-rq-red hover:bg-rq-red/25 disabled:opacity-40 font-semibold transition-colors"
      >
        Apply
      </button>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="text-center py-16 text-rq-muted text-sm">{message}</div>
  );
}

export function LoadingState() {
  return <div className="text-center py-16 text-rq-muted text-sm">Loading…</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-rq-red/10 border border-rq-red/40 text-sm text-rq-red">
      {message}
    </div>
  );
}
