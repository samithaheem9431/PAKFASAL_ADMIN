import { useState, useEffect, Suspense } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Sprout,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { MeshGradient } from "./MeshGradient.jsx";
import { Spinner } from "./Spinner.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/learning", label: "Learning", icon: BookOpen },
  {
    to: "/crops-diseases",
    label: "Crops & Diseases",
    icon: Sprout,
  },
];

function sessionUntilLabel(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

export function Layout() {
  const { user, adminProfile, logout, sessionExpiresAt } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const sessionLabel = sessionUntilLabel(sessionExpiresAt);

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
    localStorage.removeItem("pakfasal-rtl");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md shadow-emerald-600/20"
        : "text-slate-600 hover:bg-white/80"
    }`;

  const closeNav = () => setOpen(false);

  return (
    <div className="relative flex min-h-screen min-h-[100dvh] w-full min-w-0 bg-slate-50/90">
      <MeshGradient variant="admin" />
      <aside
        className={`fixed inset-y-0 z-40 flex w-[min(100%,18rem)] max-w-[85vw] flex-col border-r border-white/40 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-xl transition-transform md:static md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-emerald-100/60 bg-gradient-to-r from-white/90 to-emerald-50/40 px-4 sm:h-16">
          <Link
            to="/"
            className="min-w-0 truncate bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text text-sm font-semibold text-transparent sm:text-base"
            onClick={closeNav}
          >
            PakFasal Admin
          </Link>
          <button
            type="button"
            className="shrink-0 rounded p-1 [-webkit-tap-highlight-color:transparent] md:hidden"
            onClick={closeNav}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain p-3 pb-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={linkClass}
              onClick={closeNav}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
          {adminProfile?.role === "super_admin" && (
            <NavLink to="/admins" className={linkClass} onClick={closeNav}>
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>Admins</span>
            </NavLink>
          )}
        </nav>
        <div className="shrink-0 border-t border-emerald-100/60 bg-white/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50/90"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
          <p className="mt-2 truncate px-1 text-xs text-slate-400">
            {user?.email}
          </p>
          {sessionLabel && (
            <p className="mt-1 px-1 text-[11px] leading-snug text-slate-400">
              Session until {sessionLabel}
            </p>
          )}
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="relative z-10 flex min-h-0 min-h-screen min-h-[100dvh] w-full min-w-0 flex-1 flex-col md:pl-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-white/50 bg-white/70 px-3 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-xl md:hidden">
          <button
            type="button"
            className="rounded p-1 [-webkit-tap-highlight-color:transparent]"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="truncate font-semibold text-brand-700">PakFasal Admin</span>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 md:p-8 lg:p-10">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Spinner className="h-10 w-10 text-brand-600" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
