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
  { to: "/", label: "Dashboard", labelUr: "ڈیش بورڈ", icon: LayoutDashboard },
  { to: "/products", label: "Products", labelUr: "مصنوعات", icon: Package },
  {
    to: "/learning",
    label: "Learning",
    labelUr: "لرننگ",
    icon: BookOpen,
  },
  {
    to: "/crops-diseases",
    label: "Crops & Diseases",
    labelUr: "فصلیں و بیماریاں",
    icon: Sprout,
  },
];

export function Layout() {
  const { user, adminProfile, logout } = useAuth();
  const [rtl, setRtl] = useState(
    () => localStorage.getItem("pakfasal-rtl") === "1"
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pakfasal-rtl") === "1";
    document.documentElement.dir = saved ? "rtl" : "ltr";
    document.documentElement.lang = saved ? "ur" : "en";
  }, []);

  const toggleRtl = () => {
    const next = !rtl;
    setRtl(next);
    localStorage.setItem("pakfasal-rtl", next ? "1" : "0");
    document.documentElement.dir = next ? "rtl" : "ltr";
    document.documentElement.lang = next ? "ur" : "en";
  };

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

  return (
    <div className="relative flex min-h-screen bg-slate-50/90">
      <MeshGradient variant="admin" />
      <aside
        className={`fixed inset-y-0 z-40 w-64 border-r border-white/40 bg-white/75 shadow-lg shadow-emerald-900/5 backdrop-blur-xl transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-emerald-100/60 bg-gradient-to-r from-white/90 to-emerald-50/40 px-4">
          <Link
            to="/"
            className="bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text font-semibold text-transparent"
          >
            PakFasal Admin
          </Link>
          <button
            type="button"
            className="rounded p-1 md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1.5 p-3">
          {nav.map(({ to, label, labelUr, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={linkClass}>
              <Icon className="h-5 w-5 shrink-0" />
              <span>
                {rtl ? labelUr : label}
              </span>
            </NavLink>
          ))}
          {adminProfile?.role === "super_admin" && (
            <NavLink to="/admins" className={linkClass}>
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{rtl ? "ایڈمنز" : "Admins"}</span>
            </NavLink>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-emerald-100/60 bg-white/50 p-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={toggleRtl}
            className="mb-2 w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-left text-xs text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white/90"
          >
            {rtl ? "English LTR" : "اردو RTL"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50/90"
          >
            <LogOut className="h-5 w-5" />
            {rtl ? "لاگ آؤٹ" : "Logout"}
          </button>
          <p className="mt-2 truncate px-1 text-xs text-slate-400">
            {user?.email}
          </p>
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

      <div className="relative z-10 flex min-h-screen flex-1 flex-col md:pl-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/50 bg-white/70 px-4 shadow-sm backdrop-blur-xl md:hidden">
          <button
            type="button"
            className="rounded p-1"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-brand-700">PakFasal</span>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10">
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
