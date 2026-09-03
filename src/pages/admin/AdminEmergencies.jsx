/**
 * AdminEmergencies.jsx  —  /admin/emergency-requests
 */
import { useState, useEffect } from "react";
import { Siren } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, Badge, DeleteButton, StatusSelect, EmptyState,
  LoadingState, ErrorBanner, URGENCY_COLOR, STATUS_COLOR,
} from "../../components/admin/AdminShared.jsx";
import { adminGetEmergencies, adminSetEmergStatus, adminDeleteEmergency } from "../../api/adminApi.js";

const STATUSES = ["OPEN","MATCHING","ASSIGNED","IN_PROGRESS","RESOLVED","CANCELLED","EXPIRED"];

export default function AdminEmergencies() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("ALL");

  const load = () => {
    setLoading(true); setError("");
    adminGetEmergencies()
      .then(d => setItems(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => setError(e.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await adminSetEmergStatus(id, status);
      setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { alert(e.response?.data?.message || "Failed to update."); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteEmergency(id);
      setItems(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete."); }
  };

  const visible = filter === "ALL" ? items : items.filter(r => r.status === filter);

  const CAT_ICON = { ROAD_ACCIDENT:"🚗", FIRE:"🔥", MEDICAL_EMERGENCY:"🏥", NATURAL_DISASTER:"🌊", MISSING_PERSON:"🔍", RESCUE:"🛟", OTHER:"⚡" };

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader title="Emergency Requests" subtitle={`${items.length} total`} onRefresh={load} loading={loading} />
        <ErrorBanner message={error} />

        <div className="flex gap-2 flex-wrap mb-6">
          {["ALL",...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s ? "bg-rq-red border-rq-red text-white" : "border-rq-border text-rq-muted hover:border-rq-red/50"
              }`}>
              {s.replace(/_/g," ")}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : visible.length === 0 ? <EmptyState message="No emergency requests found." /> : (
          <div className="space-y-3">
            {visible.map(req => (
              <div key={req.id} className="bg-rq-panel border border-rq-border rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {CAT_ICON[req.category] || "⚡"}
                    </div>
                    <div>
                      <p className="font-bold">{req.category?.replace(/_/g," ") || "Emergency"}</p>
                      <p className="text-xs text-rq-muted">#{req.id} · {req.requesterName || "—"} · {req.city || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge text={req.urgency} color={URGENCY_COLOR[req.urgency]} />
                    <Badge text={req.status}  color={STATUS_COLOR[req.status]} />
                  </div>
                </div>

                {req.description && (
                  <p className="text-xs text-rq-muted bg-rq-bg rounded px-3 py-2 mb-3">{req.description}</p>
                )}
                {req.latitude && req.longitude && (
                  <p className="text-xs text-rq-muted mb-3">📍 {req.latitude.toFixed(5)}, {req.longitude.toFixed(5)}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-rq-muted mb-4">
                  <div><p className="text-[10px] uppercase tracking-wide mb-0.5">Created</p><p className="font-medium text-rq-text">{req.createdAt?.slice(0,10) || "—"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide mb-0.5">Updated</p><p className="font-medium text-rq-text">{req.updatedAt?.slice(0,10) || "—"}</p></div>
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
