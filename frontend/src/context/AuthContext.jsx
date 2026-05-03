import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase.js";
import { api } from "../services/api.js";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";

const AuthContext = createContext(null);

/** Time with no input before auto sign-out (ms). Default 2 minutes. */
const IDLE_LOGOUT_MS = Number(
  import.meta.env.VITE_IDLE_LOGOUT_MS ?? 2 * 60 * 1000
);

/** Maps Firebase Auth errors to clear login messages (email vs password where possible). */
function mapFirebaseLoginError(err) {
  const code = err?.code;
  if (code === "auth/invalid-email") {
    return "Wrong or invalid email address.";
  }
  if (code === "auth/user-not-found") {
    return "Wrong email — no account uses this address.";
  }
  if (code === "auth/wrong-password") {
    return "Wrong password.";
  }
  if (code === "auth/invalid-credential") {
    return "Incorrect email or password.";
  }
  if (code === "auth/user-disabled") {
    return "This account has been disabled.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again later.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection.";
  }
  return err?.message || "Login failed.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [adminOk, setAdminOk] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  /** ISO string when current ID token expires (Firebase session) */
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  const syncTokenExpiry = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setSessionExpiresAt(null);
      return;
    }
    try {
      const r = await firebaseUser.getIdTokenResult();
      setSessionExpiresAt(r.expirationTime);
    } catch {
      setSessionExpiresAt(null);
    }
  }, []);

  const verifyAdmin = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setAdminOk(false);
      setAdminChecked(true);
      setAdminProfile(null);
      setSessionExpiresAt(null);
      return false;
    }
    await syncTokenExpiry(firebaseUser);
    try {
      const { data } = await api.get("/api/auth/me");
      setAdminOk(true);
      setAdminChecked(true);
      setAdminProfile(data.admin || null);
      return true;
    } catch (e) {
      const status = e.response?.status;
      setAdminOk(false);
      setAdminChecked(true);
      setAdminProfile(null);
      setSessionExpiresAt(null);
      if (status === 403) {
        toast.error(
          "آپ کا اکاؤنٹ ایڈمن نہیں ہے۔ / Your account is not an admin."
        );
        await signOut(auth);
      }
      return false;
    }
  }, [syncTokenExpiry]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAdminChecked(false);
      if (u) await verifyAdmin(u);
      else {
        setAdminOk(false);
        setAdminChecked(true);
        setAdminProfile(null);
        setSessionExpiresAt(null);
      }
      setInitializing(false);
    });
    return () => unsub();
  }, [verifyAdmin]);

  useEffect(() => {
    if (!user || !adminOk) return undefined;
    const id = window.setInterval(() => {
      syncTokenExpiry(user);
    }, 60_000);
    return () => window.clearInterval(id);
  }, [user, adminOk, syncTokenExpiry]);

  /** Mint / refresh HTTP-only session cookie on the API (after admin check passes). */
  useEffect(() => {
    if (!user || !adminOk) return undefined;
    api.post("/api/auth/cookie").catch(() => {});
    return undefined;
  }, [user, adminOk]);

  const loginEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      trackEvent("admin_login", { method: "email" });
    } catch (e) {
      throw new Error(mapFirebaseLoginError(e));
    }
  };

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    trackEvent("admin_login", { method: "google" });
  };

  const logout = useCallback(async (opts = {}) => {
    const { analyticsExtra } = opts;
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* still sign out locally */
    }
    await signOut(auth);
    setAdminOk(false);
    setAdminChecked(false);
    setAdminProfile(null);
    setSessionExpiresAt(null);
    trackEvent("admin_logout", analyticsExtra ?? {});
  }, []);

  /** Auto sign-out after IDLE_LOGOUT_MS with no pointer/keyboard/scroll activity */
  useEffect(() => {
    if (!adminOk || !user) return undefined;

    let timeoutId;

    const fireIdleLogout = async () => {
      toast.error("Signed out due to inactivity.");
      await logout({ analyticsExtra: { reason: "idle_timeout" } });
    };

    const reset = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(fireIdleLogout, IDLE_LOGOUT_MS);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll", "click", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    let lastMoveReset = 0;
    const onMove = () => {
      const now = Date.now();
      if (now - lastMoveReset < 15_000) return;
      lastMoveReset = now;
      reset();
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    reset();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, reset));
      window.removeEventListener("mousemove", onMove);
    };
  }, [adminOk, user, logout]);

  const refreshAdmin = useCallback(async () => {
    const u = auth.currentUser;
    if (u) await verifyAdmin(u);
  }, [verifyAdmin]);

  /** Refresh Firebase ID token and session expiry (extends server-valid session). */
  const refreshSession = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return;
    await u.getIdToken(true);
    await syncTokenExpiry(u);
  }, [syncTokenExpiry]);

  const value = useMemo(
    () => ({
      user,
      adminProfile,
      initializing,
      adminOk,
      adminChecked,
      sessionExpiresAt,
      loginEmail,
      loginGoogle,
      logout,
      refreshAdmin,
      refreshSession,
    }),
    [
      user,
      adminProfile,
      initializing,
      adminOk,
      adminChecked,
      sessionExpiresAt,
      logout,
      refreshAdmin,
      refreshSession,
      verifyAdmin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
