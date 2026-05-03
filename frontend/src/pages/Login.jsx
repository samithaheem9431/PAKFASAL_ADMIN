import { lazy, Suspense, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
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
  const { loginEmail, loginGoogle, user, adminOk, adminChecked } = useAuth();
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

  const onGoogle = async () => {
    setBusy(true);
    try {
      await loginGoogle();
    } catch (e) {
      toast.error(e.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

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

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
              <span className="text-xs font-medium text-slate-500">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
            </div>

            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 py-2.5 text-sm font-medium text-slate-800 shadow-md shadow-slate-900/5 backdrop-blur-sm transition hover:bg-white/90 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
