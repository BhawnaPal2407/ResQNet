/**
 * volunteers.js
 * ------------------------------------------------------------------
 * Volunteer API calls.
 * ------------------------------------------------------------------
 */
import api from "./axios";

/** Get all volunteers (public) */
export const getVolunteers = (params = {}) =>
  api.get("/volunteers", { params }).then((r) => r.data);

/** Get a single volunteer by id */
export const getVolunteerById = (id) =>
  api.get(`/volunteers/${id}`).then((r) => r.data);

/** Get logged-in volunteer's own profile */
export const getMyVolunteerProfile = () =>
  api.get("/volunteers/me").then((r) => r.data);

/** Register the logged-in user as a volunteer */
export const registerAsVolunteer = (payload) =>
  api.post("/volunteers/register", payload).then((r) => r.data);

/** Update logged-in volunteer's profile */
export const updateVolunteerProfile = (payload) =>
  api.put("/volunteers/me", payload).then((r) => r.data);

/** Toggle availability */
export const toggleVolunteerAvailability = () =>
  api.patch("/volunteers/me/toggle-availability").then((r) => r.data);
