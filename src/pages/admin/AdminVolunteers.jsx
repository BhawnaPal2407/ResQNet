/**
 * AdminVolunteers.jsx  —  /admin/volunteers
 * Uses GET /api/admin/volunteers (returns ALL verification statuses).
 * Admin can: approve, reject, suspend, delete.
 * Full profile info is shown for each volunteer.
 */
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, Badge, DeleteButton, EmptyState, LoadingState, ErrorBanner, VERIFY_COLOR,
} from "../../components/admin/AdminShared.jsx";
import { adminGetVolunteers, adminVerifyVolunteer, adminDeleteVolunteer } from "../../api/adminApi.js";
import { getVolunteers } from "../../api/volunteers.js";

const VERIFY_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export default function AdminVolunteers() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [search,  setSearch]  = useState("");

  const load = () => {
    setLoading(true); setError("");
    adminGetVolunteers()
      .then(d => setItems(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => {
        const status = e.response?.status;
        const msg    = e.response?.data?.message || e.response?.data;
        if (status === 500) {
          getVolunteers()
            .then(d => {
              setItems(Array.isArray(d) ? d : d?.content ?? []);
              setError("Note: Showing public volunteer data (admin endpoint returned a server error).");
            })
            .catch(() => setError("Failed to load volunteers. The backend returned a server error."))
            .finally(() => setLoading(false));
          return;
        }
        setError(typeof msg === "string" ? msg : "Failed to load volunteers.");
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleVerify = async (id, status) => {
    try {
      const updated = await adminVerifyVolunteer(id, status);
      setItems(prev => prev.map(v =>
        v.id === id ? { ...v, verificationStatus: updated.verificationStatus || status } : v
      ));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteVolunteer(id);
      setItems(prev => prev.filter(v => v.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete."); }
  };

  const pendingCount = items.filter(v => v.verificationStatus === "PENDING").length;

  const visible = items
    .filter(v => filter === "ALL" || v.verificationStatus === filter)
    .filter(v =>
      search === "" ||
      (v.volunteerName || v.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.organizationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.serviceArea || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              Volunteers
              {pendingCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold border border-yellow-500/30">
                  {pendingCount} pending
                </span>
              )}
            </span>
          }
          subtitle={`${items.length} total registered`}
          onRefresh={load}
          loading={loading}
        />
        <ErrorBanner message={error} />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, org, area…"
            className="bg-rq-panel border border-rq-border rounded-lg px-4 py-2 text-sm outline-none focus:border-rq-red flex-1 min-w-48"
          />
          <div className="flex gap-2 flex-wrap">
            {["ALL", ...VERIFY_STATUSES].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors font-semibold ${
                  filter === s
                    ? "bg-rq-red border-rq-red text-white"
                    : "border-rq-border text-rq-muted hover:border-rq-red/50"
                }`}>
                {s}
                {s === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-yellow-500/30 text-yellow-400 rounded-full px-1.5 py-0.5 text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingState /> : visible.length === 0 ? (
          <EmptyState message={
            items.length === 0
              ? "No volunteers have registered yet."
              : "No volunteers match your filter."
          } />
        ) : (
          <div className="space-y-4">
            {visible.map(v => {
              const name = v.volunteerName || v.contactName || "—";
              const status = v.verificationStatus || "PENDING";

              return (
                <div key={v.id}
                  className={`bg-rq-panel border rounded-xl p-6 transition-colors ${
                    status === "PENDING" ? "border-yellow-500/40" : "border-rq-border"
                  }`}>

                  {/* ── Header row ── */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xl flex-shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-base">{name}</p>
                        <p className="text-sm text-rq-muted">{v.organizationName || "Independent Volunteer"}</p>
                        <p className="text-xs text-rq-muted mt-0.5">Volunteer ID: #{v.id} · User ID: #{v.userId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge text={status} color={VERIFY_COLOR[status]} />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        v.available ? "bg-green-500/15 text-green-400" : "bg-rq-muted/15 text-rq-muted"
                      }`}>
                        {v.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* ── Full profile info grid ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 text-sm">
                    <InfoCell label="Services Offered"  value={v.services    || "—"} />
                    <InfoCell label="Service Area"      value={v.serviceArea || "—"} />
                    <InfoCell label="Contact Name"      value={v.contactName || "—"} />
                    <InfoCell
                      label="Contact Phone"
                      value={v.contactPhone ? (
                        <a href={`tel:${v.contactPhone}`} className="text-rq-red hover:underline flex items-center gap-1">
                          <Phone size={11} /> {v.contactPhone}
                        </a>
                      ) : "—"}
                    />
                    <InfoCell label="Registered On" value={v.createdAt?.slice(0,10) || "—"} />
                    <InfoCell label="Last Updated"  value={v.updatedAt?.slice(0,10) || "—"} />
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-rq-border">
                    {status !== "APPROVED" && (
                      <button onClick={() => handleVerify(v.id, "APPROVED")}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 font-semibold transition-colors">
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    )}
                    {status !== "REJECTED" && (
                      <button onClick={() => handleVerify(v.id, "REJECTED")}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-rq-red/15 text-rq-red border border-rq-red/30 hover:bg-rq-red/25 font-semibold transition-colors">
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                    {status !== "SUSPENDED" && status === "APPROVED" && (
                      <button onClick={() => handleVerify(v.id, "SUSPENDED")}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-rq-muted/15 text-rq-muted border border-rq-border hover:border-rq-red hover:text-rq-red font-semibold transition-colors">
                        <PauseCircle size={13} /> Suspend
                      </button>
                    )}
                    {status === "SUSPENDED" && (
                      <button onClick={() => handleVerify(v.id, "APPROVED")}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 font-semibold transition-colors">
                        <CheckCircle2 size={13} /> Reinstate
                      </button>
                    )}
                    <div className="ml-auto">
                      <DeleteButton onDelete={() => handleDelete(v.id)} label="Remove" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-rq-muted uppercase tracking-wide mb-0.5">{label}</p>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}
