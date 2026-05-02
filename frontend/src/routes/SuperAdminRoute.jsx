import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function SuperAdminRoute({ children }) {
  const { adminProfile } = useAuth();
  if (adminProfile?.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

