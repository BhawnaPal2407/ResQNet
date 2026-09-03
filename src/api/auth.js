/**
 * auth.js
 * ------------------------------------------------------------------
 * Auth API calls — register & login.
 * Both return: { token, userId, name, email, role }
 * ------------------------------------------------------------------
 */
import api from "./axios";

/**
 * Login with email + password.
 * @param {{ email: string, password: string }} credentials
 */
export const loginUser = (credentials) =>
  api.post("/auth/login", credentials).then((r) => r.data);

/**
 * Register a new user.
 * @param {{ name, phone, email, password, bloodGroup, city, role }} payload
 */
export const registerUser = (payload) =>
  api.post("/auth/register", payload).then((r) => r.data);
