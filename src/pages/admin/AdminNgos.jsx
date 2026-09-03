/**
 * AdminNgos.jsx  —  /admin/ngos
 */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, Badge, DeleteButton, EmptyState, LoadingState, ErrorBanner, VERIFY_COLOR,
} from "../../components/admin/AdminShared.jsx";
import { adminGetNgos, adminVerifyNgo, adminDeleteNgo } from "../../api/adminApi.js";

const VERIFY_STATUSES = ["PENDING","APPROVED","REJECTED","SUSPENDED"];

export default function AdminNgos() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("ALL");

  const load = () => {
    setLoading(true); setError("");
    adminGetNgos()
      .then(d => setItems(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => setError(e.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleVerify = async (id, status) => {
    try {
      const updated = await adminVerifyNgo(id, status);
      setItems(prev => prev.map(n => n.id === id ? { ...n, verificationStatus: updated.verificationStatus || status } : n));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteNgo(id);
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete."); }
  };

  const visible = filter === "ALL" ? items : items.filter(n => n.verificationStatus === filter);
  const pendingCount = items.filter(n => n.verificationStatus === "PENDING").length;

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader
          title={<span>NGOs {pendingCount > 0 && <span className="ml-2 text-sm text-yellow-400">({pendingCount} pending)</span>}</span>}
          subtitle={`${items.length} total`}
          onRefresh={load}
          loading={loading}
        />
        <ErrorBanner message={error} />

        <div className="flex gap-2 flex-wrap mb-6">
          {["ALL",...VERIFY_STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s ? "bg-rq-red border-rq-red text-white" : "border-rq-border text-rq-muted hover:border-rq-red/50"
              }`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : visible.length === 0 ? <EmptyState message="No NGOs found." /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {visible.map(n => (
              <div key={n.id} className="bg-rq-panel border border-rq-border rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-orange-500/15 flex items-center justify-center font-bold text-orange-400 text-lg flex-shrink-0">
                      {(n.organizationName || "N").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{n.organizationName || "—"}</p>
                      <p className="text-xs text-rq-muted">{n.contactName || "—"}</p>
                    </div>
                  </div>
                  <Badge text={n.verificationStatus || "PENDING"} color={VERIFY_COLOR[n.verificationStatus || "PENDING"]} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Services",    n.services    || "—"],
                    ["Service Area",n.serviceArea || "—"],
                    ["Phone",       n.contactPhone|| "—"],
                    ["Available",   n.available ? "Yes" : "No"],
                    ["Created",     n.createdAt?.slice(0,10) || "—"],
                  ].map(([l,val]) => (
                    <div key={l}><p className="text-[10px] text-rq-muted uppercase tracking-wide">{l}</p><p className="font-medium text-rq-text truncate">{val}</p></div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-rq-border">
                  {VERIFY_STATUSES.filter(s => s !== n.verificationStatus).map(s => (
                    <button key={s} onClick={() => handleVerify(n.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${VERIFY_COLOR[s]} hover:opacity-80`}>
                      {s === "APPROVED" ? "✓ Approve" : s === "REJECTED" ? "✗ Reject" : s === "SUSPENDED" ? "⏸ Suspend" : s}
                    </button>
                  ))}
                  <DeleteButton onDelete={() => handleDelete(n.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
