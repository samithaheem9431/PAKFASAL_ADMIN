import { lazy, Suspense, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { MeshGradient } from "../components/MeshGradient.jsx";

const TractorLottie = lazy(() =>
  import("../components/TractorLottie.jsx").then((m) => ({
    default: m.TractorLottie,
  }))
);

const SplineHero = lazy(() =>
  import("../components/SplineHero.jsx").then((m) => ({ default: m.SplineHero }))
);

const splineScene = import.meta.env.VITE_SPLINE_SCENE_URL?.trim();

export function Login() {
  const { loginEmail, user, adminOk, adminChecked } = useAuth();
  const loc = useLocation();
  const from = loc.state?.from || "/";
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  if (user && adminOk && adminChecked) {
    return <Navigate to={from} replace />;
  }

  const onEmail = handleSubmit(async ({ email, password }) => {
    setBusy(true);
    setAuthError("");
    try {
      await loginEmail(email.trim(), password);
    } catch (e) {
      const msg = e.message || "Login failed";
      setAuthError(msg);
    } finally {
      setBusy(false);
    }
  });

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <MeshGradient variant="auth" />

      <div className="relative z-10 flex min-h-screen min-h-[100dvh] flex-col lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-700/90">
            PakFasal
          </p>
          <h2 className="mb-6 max-w-md text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
            Admin access
          </h2>

          {splineScene ? (
            <Suspense
              fallback={
                <div className="flex min-h-[240px] items-center justify-center md:min-h-[280px]">
                  <Spinner className="h-10 w-10 text-brand-600" />
                </div>
              }
            >
              <SplineHero className="mb-6 w-full max-w-lg" />
            </Suspense>
          ) : (
            <Suspense
              fallback={
                <div className="flex h-[220px] items-center justify-center md:h-[280px]">
                  <Spinner className="h-10 w-10 text-brand-600" />
                </div>
              }
            >
              <TractorLottie className="mb-6" />
            </Suspense>
          )}

          <p className="max-w-sm text-center text-sm leading-relaxed text-slate-700/90">
            Secure agriculture ops console — tractor, fasal, and your team in one
            place.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 pb-[max(3rem,env(safe-area-inset-bottom))] lg:pb-8">
          <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white/55 p-5 shadow-2xl shadow-emerald-900/10 ring-1 ring-white/60 backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 inline-flex rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-600/25">
                Authenticated admins only
              </div>
              <h1 className="text-xl font-bold text-slate-900">PakFasal Admin</h1>
              <p className="mt-1 text-sm text-slate-600">
                Sign in with an admin account
              </p>
            </div>

            <form onSubmit={onEmail} className="space-y-4" noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`w-full rounded-xl border-0 bg-white/70 px-3.5 py-2.5 text-sm shadow-inner shadow-slate-900/5 ring-1 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "ring-red-400 focus:ring-red-500/40"
                      : "ring-slate-200/80 focus:ring-brand-500/40"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  className={`w-full rounded-xl border-0 bg-white/70 px-3.5 py-2.5 text-sm shadow-inner shadow-slate-900/5 ring-1 transition focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "ring-red-400 focus:ring-red-500/40"
                      : "ring-slate-200/80 focus:ring-brand-500/40"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {authError && (
                <p
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200/80"
                  role="alert"
                >
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 disabled:opacity-50"
              >
                {busy ? "…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
