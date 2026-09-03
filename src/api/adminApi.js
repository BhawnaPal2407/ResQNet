/**
 * adminApi.js
 * ------------------------------------------------------------------
 * Dedicated axios instance for /api/admin/** endpoints.
 * All calls require ADMIN JWT. On 401/403 → redirect to /login.
 * ------------------------------------------------------------------
 */
import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:8080/api/admin",
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("rq_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default adminApi;

/* ── Dashboard ── */
export const getDashboardStats      = ()          => adminApi.get("/dashboard").then(r => r.data);

/* ── Users ── */
export const getAllUsers             = (role)      => adminApi.get("/users", { params: role ? { role } : {} }).then(r => r.data);
export const getUserById            = (id)        => adminApi.get(`/users/${id}`).then(r => r.data);
export const changeUserRole         = (id, role)  => adminApi.patch(`/users/${id}/role`, { role }).then(r => r.data);
export const deleteUser             = (id)        => adminApi.delete(`/users/${id}`);

/* ── Blood Donors ── */
export const adminGetAllDonors      = ()          => adminApi.get("/blood-donors").then(r => r.data);
export const adminDeleteDonor       = (id)        => adminApi.delete(`/blood-donors/${id}`);

/* ── Blood Requests ── */
export const adminGetBloodRequests  = ()          => adminApi.get("/blood-requests").then(r => r.data);
export const adminSetBloodStatus    = (id, status)=> adminApi.patch(`/blood-requests/${id}/status?status=${status}`).then(r => r.data);
export const adminDeleteBloodReq    = (id)        => adminApi.delete(`/blood-requests/${id}`);

/* ── Emergency Requests ── */
export const adminGetEmergencies    = ()          => adminApi.get("/emergency-requests").then(r => r.data);
export const adminSetEmergStatus    = (id, status)=> adminApi.patch(`/emergency-requests/${id}/status?status=${status}`).then(r => r.data);
export const adminDeleteEmergency   = (id)        => adminApi.delete(`/emergency-requests/${id}`);

/* ── Volunteers ── */
export const adminGetVolunteers     = ()          => adminApi.get("/volunteers").then(r => r.data);
export const adminGetPendingVols    = ()          => adminApi.get("/volunteers/pending").then(r => r.data);
export const adminVerifyVolunteer   = (id, status)=> adminApi.patch(`/volunteers/${id}/verify?status=${status}`).then(r => r.data);
export const adminDeleteVolunteer   = (id)        => adminApi.delete(`/volunteers/${id}`);

/* ── NGOs ── */
export const adminGetNgos           = ()          => adminApi.get("/ngos").then(r => r.data);
export const adminGetPendingNgos    = ()          => adminApi.get("/ngos/pending").then(r => r.data);
export const adminVerifyNgo         = (id, status)=> adminApi.patch(`/ngos/${id}/verify?status=${status}`).then(r => r.data);
export const adminDeleteNgo         = (id)        => adminApi.delete(`/ngos/${id}`);
