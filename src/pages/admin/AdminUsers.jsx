/**
 * AdminUsers.jsx  —  /admin/users
 * List all users, filter by role, change role, delete.
 */
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import {
  PageHeader, Badge, DeleteButton, EmptyState, LoadingState, ErrorBanner,
} from "../../components/admin/AdminShared.jsx";
import { getAllUsers, changeUserRole, deleteUser } from "../../api/adminApi.js";

const ROLES = ["", "ADMIN", "USER", "DONOR", "VOLUNTEER", "HOSPITAL", "NGO"];
const ROLE_COLOR = {
  ADMIN: "bg-rq-red/15 text-rq-red",
  USER:  "bg-rq-muted/15 text-rq-muted",
  DONOR: "bg-green-500/15 text-green-400",
  VOLUNTEER: "bg-blue-500/15 text-blue-400",
  HOSPITAL:  "bg-purple-500/15 text-purple-400",
  NGO:       "bg-orange-500/15 text-orange-400",
};

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("");
  const [search,  setSearch]  = useState("");

  const load = (role) => {
    setLoading(true); setError("");
    getAllUsers(role || undefined)
      .then(d => setUsers(Array.isArray(d) ? d : d?.content ?? []))
      .catch(e => setError(e.response?.data?.message || "Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await changeUserRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role || role } : u));
    } catch (e) { alert(e.response?.data?.message || "Failed to change role."); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { alert(e.response?.data?.message || "Failed to delete user."); }
  };

  const visible = users.filter(u =>
    search === "" ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <PageHeader title="Users" subtitle={`${users.length} total`} onRefresh={() => load(filter)} loading={loading} />
        <ErrorBanner message={error} />

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="bg-rq-panel border border-rq-border rounded-lg px-4 py-2 text-sm outline-none focus:border-rq-red flex-1 min-w-48"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-rq-panel border border-rq-border rounded-lg px-4 py-2 text-sm outline-none focus:border-rq-red"
          >
            <option value="">All Roles</option>
            {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading ? <LoadingState /> : visible.length === 0 ? <EmptyState message="No users found." /> : (
          <div className="bg-rq-panel border border-rq-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rq-border text-xs text-rq-muted uppercase tracking-wide">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id} className="border-b border-rq-border/50 hover:bg-rq-bg transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rq-red/15 flex items-center justify-center text-rq-red font-bold text-xs flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-rq-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-rq-muted text-xs">{u.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role || "USER"}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded font-semibold border border-transparent focus:border-rq-red outline-none ${ROLE_COLOR[u.role] || "bg-rq-muted/15 text-rq-muted"}`}
                      >
                        {ROLES.filter(Boolean).map(r => <option key={r} value={r} className="bg-rq-panel text-rq-text">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-rq-muted">{u.createdAt?.slice(0,10) || "—"}</td>
                    <td className="px-5 py-3">
                      <DeleteButton onDelete={() => handleDelete(u.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
