/**
 * axios.js
 * ------------------------------------------------------------------
 * Configured axios instance for all API calls.
 * - Base URL points to the Spring Boot backend
 * - Request interceptor attaches the JWT token automatically
 * - Response interceptor clears storage and redirects on 401
 * ------------------------------------------------------------------
 */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (token expired / invalid), log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rq_token");
      localStorage.removeItem("rq_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
