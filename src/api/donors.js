/**
 * donors.js
 * ------------------------------------------------------------------
 * Blood donor API calls.
 * ------------------------------------------------------------------
 */
import api from "./axios";

/** Search donors — public endpoint.
 *  @param {{ bloodGroup?: string, city?: string, radius?: number }} params
 */
export const searchDonors = (params = {}) =>
  api.get("/blood-donors/search", { params }).then((r) => r.data);

/** Get a single donor by id */
export const getDonorById = (id) =>
  api.get(`/blood-donors/${id}`).then((r) => r.data);

/** Get logged-in donor's own profile */
export const getMyDonorProfile = () =>
  api.get("/blood-donors/me").then((r) => r.data);

/** Register the logged-in user as a blood donor */
export const registerAsDonor = (payload) =>
  api.post("/blood-donors/register", payload).then((r) => r.data);

/** Update logged-in donor's profile */
export const updateDonorProfile = (payload) =>
  api.put("/blood-donors/me", payload).then((r) => r.data);

/** Toggle availability (available ↔ unavailable) */
export const toggleDonorAvailability = () =>
  api.patch("/blood-donors/me/toggle-availability").then((r) => r.data);
