/**
 * emergencies.js
 * ------------------------------------------------------------------
 * Blood request & emergency request API calls.
 * ------------------------------------------------------------------
 */
import api from "./axios";

/* ─── Blood Requests ─────────────────────────────────────────── */

/** Get all blood requests (public) */
export const getBloodRequests = (params = {}) =>
  api.get("/blood-requests", { params }).then((r) => r.data);

/** Get logged-in user's own blood requests */
export const getMyBloodRequests = () =>
  api.get("/blood-requests/me").then((r) => r.data);

/** Get a single blood request by id */
export const getBloodRequestById = (id) =>
  api.get(`/blood-requests/${id}`).then((r) => r.data);

/** Create a new blood request
 *  Required: bloodGroup, urgency, city, units
 *  Optional: hospitalName, patientName, contactNumber, notes
 */
export const createBloodRequest = (payload) =>
  api.post("/blood-requests", payload).then((r) => r.data);

/** Update status of a blood request */
export const updateBloodRequestStatus = (id, status) =>
  api.patch(`/blood-requests/${id}/status`, { status }).then((r) => r.data);

/** Cancel a blood request */
export const cancelBloodRequest = (id) =>
  api.patch(`/blood-requests/${id}/cancel`).then((r) => r.data);

/* ─── Emergency Requests ─────────────────────────────────────── */

/** Get all emergency requests (public) */
export const getEmergencyRequests = (params = {}) =>
  api.get("/emergency-requests", { params }).then((r) => r.data);

/** Get logged-in user's own emergency requests */
export const getMyEmergencyRequests = () =>
  api.get("/emergency-requests/me").then((r) => r.data);

/** Get a single emergency request by id */
export const getEmergencyRequestById = (id) =>
  api.get(`/emergency-requests/${id}`).then((r) => r.data);

/** Create a new emergency request */
export const createEmergencyRequest = (payload) =>
  api.post("/emergency-requests", payload).then((r) => r.data);

/** Update status of an emergency request */
export const updateEmergencyStatus = (id, status) =>
  api.patch(`/emergency-requests/${id}/status`, { status }).then((r) => r.data);

/** Cancel an emergency request */
export const cancelEmergencyRequest = (id) =>
  api.patch(`/emergency-requests/${id}/cancel`).then((r) => r.data);

/** Resolve an emergency request */
export const resolveEmergencyRequest = (id) =>
  api.patch(`/emergency-requests/${id}/resolve`).then((r) => r.data);

/** Volunteer responds to an emergency — POST /api/emergency-requests/{id}/respond
 *  Returns the updated emergency request with responder details attached.
 */
export const respondToEmergency = (id) =>
  api.post(`/emergency-requests/${id}/respond`).then((r) => r.data);
