import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "../components/Spinner.jsx";

export function ProtectedRoute({ children }) {
  const { user, initializing, adminOk, adminChecked } = useAuth();
  const loc = useLocation();

  if (initializing || (user && !adminChecked)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!user || !adminOk) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
