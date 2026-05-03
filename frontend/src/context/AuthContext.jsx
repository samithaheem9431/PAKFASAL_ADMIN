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

  const verifyAdmin = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setAdminOk(false);
      setAdminChecked(true);
      setAdminProfile(null);
      return false;
    }
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
      if (status === 403) {
        toast.error(
          "آپ کا اکاؤنٹ ایڈمن نہیں ہے۔ / Your account is not an admin."
        );
        await signOut(auth);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAdminChecked(false);
      if (u) await verifyAdmin(u);
      else {
        setAdminOk(false);
        setAdminChecked(true);
        setAdminProfile(null);
      }
      setInitializing(false);
    });
    return () => unsub();
  }, [verifyAdmin]);

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

  const logout = async () => {
    await signOut(auth);
    setAdminOk(false);
    setAdminChecked(false);
    setAdminProfile(null);
    trackEvent("admin_logout");
  };

  const refreshAdmin = useCallback(async () => {
    const u = auth.currentUser;
    if (u) await verifyAdmin(u);
  }, [verifyAdmin]);

  const value = useMemo(
    () => ({
      user,
      adminProfile,
      initializing,
      adminOk,
      adminChecked,
      loginEmail,
      loginGoogle,
      logout,
      refreshAdmin,
    }),
    [
      user,
      adminProfile,
      initializing,
      adminOk,
      adminChecked,
      logout,
      refreshAdmin,
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
