import axios from "axios";
import { auth } from "./firebase.js";

/**
 * Base URL logic:
 * - Production → uses VITE_API_URL (Render backend)
 * - Development → uses localhost
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL,
  /** Required so HTTP-only session cookie (`pakfasal.sid`) is sent cross-origin */
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach Firebase ID token to every request
 */
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * On 401, refresh ID token once and retry (keeps API session alive across expiry edges).
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (
      status !== 401 ||
      !original ||
      original._retry ||
      !auth.currentUser
    ) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      await auth.currentUser.getIdToken(true);
      const token = await auth.currentUser.getIdToken();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  }
);

/**
 * File upload helper
 */
export async function uploadFile(file) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const token = await user.getIdToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseURL}/api/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }

  return response.json();
}