/**
 * AdminBloodRequests.jsx  —  /admin/blood-requests
 */
import { useState, useEffect } from "react";
import { HeartPulse } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, Badge, DeleteButton, StatusSelect, EmptyState,
  LoadingState, ErrorBanner, URGENCY_COLOR, STATUS_COLOR,
} from "../../components/admin/AdminShared.jsx";
import { adminGetBloodRequests, adminSetBloodStatus, adminDeleteBloodReq } from "../../api/adminApi.js";

const STATUSES = ["OPEN","MATCHING","DONOR_NOTIFIED","DONOR_ACCEPTED","DONATION_IN_PROGRESS","COMPLETED","CANCELLED","EXPIRED"];

export default function AdminBloodRequests() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("ALL");

  const load = () => {
    setLoading(true); setError("");
    adminGetBloodRequests()
      .then(d => setItems(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => setError(e.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await adminSetBloodStatus(id, status);
      setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteBloodReq(id);
      setItems(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete."); }
  };

  const visible = filter === "ALL" ? items : items.filter(r => r.status === filter);

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader title="Blood Requests" subtitle={`${items.length} total`} onRefresh={load} loading={loading} />
        <ErrorBanner message={error} />

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {["ALL", ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s ? "bg-rq-red border-rq-red text-white" : "border-rq-border text-rq-muted hover:border-rq-red/50"
              }`}>
              {s.replace(/_/g," ")}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : visible.length === 0 ? <EmptyState message="No blood requests found." /> : (
          <div className="space-y-3">
            {visible.map(req => (
              <div key={req.id} className="bg-rq-panel border border-rq-border rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rq-red/10 flex items-center justify-center flex-shrink-0">
                      <HeartPulse className="text-rq-red" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-rq-red text-xl leading-none">{req.bloodGroup}</p>
                      <p className="text-xs text-rq-muted">#{req.id} · {req.requesterName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge text={req.urgency} color={URGENCY_COLOR[req.urgency]} />
                    <Badge text={req.status}  color={STATUS_COLOR[req.status]} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-rq-muted mb-4">
                  {[
                    ["Units",    req.units],
                    ["Hospital", req.hospitalName || "—"],
                    ["City",     req.city || "—"],
                    ["Matched",  req.matchedDonorId ? `Donor #${req.matchedDonorId}` : "None"],
                    ["Created",  req.createdAt?.slice(0,10) || "—"],
                    ["Updated",  req.updatedAt?.slice(0,10) || "—"],
                  ].map(([l,v]) => (
                    <div key={l}><p className="text-[10px] uppercase tracking-wide mb-0.5">{l}</p><p className="font-medium text-rq-text">{v}</p></div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-3 border-t border-rq-border">
                  <StatusSelect current={req.status} options={STATUSES} onApply={s => handleStatus(req.id, s)} />
                  <DeleteButton onDelete={() => handleDelete(req.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
