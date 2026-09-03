/**
 * admin.js
 * ------------------------------------------------------------------
 * Admin-only API calls (all require ADMIN JWT role).
 * ------------------------------------------------------------------
 */
import api from "./axios";

/* ── Blood Requests ── */
export const getAllBloodRequests    = ()        => api.get("/blood-requests").then(r => r.data);
export const matchDonorToRequest   = (reqId, donorId) =>
  api.patch(`/blood-requests/${reqId}/match-donor?donorId=${donorId}`).then(r => r.data);
export const updateBloodReqStatus  = (reqId, status) =>
  api.patch(`/blood-requests/${reqId}/status`, { status }).then(r => r.data);
export const cancelBloodReq        = (reqId) =>
  api.patch(`/blood-requests/${reqId}/cancel`).then(r => r.data);

/* ── Emergency Requests ── */
export const getAllEmergencyRequests = ()       => api.get("/emergency-requests").then(r => r.data);
export const updateEmergencyReqStatus = (id, status) =>
  api.patch(`/emergency-requests/${id}/status`, { status }).then(r => r.data);
export const resolveEmergencyReq    = (id)     =>
  api.patch(`/emergency-requests/${id}/resolve`).then(r => r.data);
export const cancelEmergencyReq     = (id)     =>
  api.patch(`/emergency-requests/${id}/cancel`).then(r => r.data);

/* ── Volunteers ── */
export const getAllVolunteers       = ()        => api.get("/volunteers").then(r => r.data);
export const verifyVolunteer       = (id, status) =>
  api.patch(`/volunteers/${id}/verify?status=${status}`).then(r => r.data);

/* ── Donors ── */
export const getAllDonors           = ()        => api.get("/blood-donors/search").then(r => r.data);

/* ── NGOs ── */
export const getAllNgos             = ()        => api.get("/ngos").then(r => r.data);
export const verifyNgo             = (id, status) =>
  api.patch(`/ngos/${id}/verify?status=${status}`).then(r => r.data);
