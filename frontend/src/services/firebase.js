import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/** `local` (default) = survives browser restart; `session` = ends when tab closes */
const persistenceMode = import.meta.env.VITE_AUTH_PERSISTENCE?.toLowerCase();
const persistence =
  persistenceMode === "session"
    ? browserSessionPersistence
    : browserLocalPersistence;
setPersistence(auth, persistence).catch((err) => {
  console.error("Firebase auth persistence:", err);
});

export let analytics = null;

// Initialize analytics only when supported in this browser/runtime.
if (typeof window !== "undefined") {
  isSupported().then((ok) => {
    if (ok && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  });
}
