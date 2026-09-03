/**
 * AdminBloodDonors.jsx  —  /admin/blood-donors
 */
import { useState, useEffect } from "react";
import { Droplet } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, DeleteButton, EmptyState, LoadingState, ErrorBanner,
} from "../../components/admin/AdminShared.jsx";
import { adminGetAllDonors, adminDeleteDonor } from "../../api/adminApi.js";

export default function AdminBloodDonors() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  const load = () => {
    setLoading(true); setError("");
    adminGetAllDonors()
      .then(d => setItems(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => setError(e.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await adminDeleteDonor(id);
      setItems(prev => prev.filter(d => d.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete."); }
  };

  const visible = items.filter(d =>
    search === "" ||
    (d.donorName || d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.bloodGroup || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader title="Blood Donors" subtitle={`${items.length} registered`} onRefresh={load} loading={loading} />
        <ErrorBanner message={error} />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, blood group, city…"
          className="w-full bg-rq-panel border border-rq-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rq-red mb-6"
        />

        {loading ? <LoadingState /> : visible.length === 0 ? <EmptyState message="No donors found." /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(d => (
              <div key={d.id} className="bg-rq-panel border border-rq-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-rq-red/15 flex items-center justify-center font-bold text-rq-red text-lg flex-shrink-0">
                    {(d.donorName || d.name || "D").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{d.donorName || d.name || "—"}</p>
                    <p className="text-xs text-rq-muted">{d.donorPhone || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  {[
                    ["Blood Group",   d.bloodGroup || "—"],
                    ["City",          d.city || "—"],
                    ["Available",     d.available ? "Yes" : "No"],
                    ["Last Donated",  d.lastDonationDate || "Never"],
                  ].map(([l,v]) => (
                    <div key={l}><p className="text-[10px] text-rq-muted uppercase tracking-wide">{l}</p>
                      <p className={`font-medium ${l === "Available" ? (d.available ? "text-green-400" : "text-rq-muted") : "text-rq-text"}`}>{v}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-rq-border">
                  <DeleteButton onDelete={() => handleDelete(d.id)} label="Remove Donor" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
