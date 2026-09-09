import axios from "axios";
import { auth } from "./firebase.js";

/**
 * Base URL logic:
 * - Explicit VITE_API_URL wins
 * - Production build → Render API
 * - Local dev → localhost
 */
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD
    ? "https://pakfasal-admin.onrender.com"
    : "http://localhost:4000");

/** Public Cloudinary unsigned upload (no server secrets needed) */
const CLOUDINARY_CLOUD =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "dur9ih5am";
const CLOUDINARY_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || "pakfasal_admin";

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

/** Direct browser → Cloudinary unsigned upload */
async function uploadToCloudinaryDirect(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "pakfasal/admin-uploads");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }
  if (!data.secure_url) {
    throw new Error("Cloudinary returned no URL");
  }
  return { url: data.secure_url, host: "cloudinary-direct" };
}

/** Fallback: backend /api/upload (Cloudinary or disk) */
async function uploadViaApi(file) {
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

/**
 * File upload helper — Cloudinary direct first, then API fallback
 */
export async function uploadFile(file) {
  try {
    return await uploadToCloudinaryDirect(file);
  } catch (directErr) {
    console.warn("Direct Cloudinary failed, trying API:", directErr?.message);
    return uploadViaApi(file);
  }
}
