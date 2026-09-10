import { lazy, Suspense, useEffect, useState } from "react";

const TractorLottie = lazy(() =>
  import("./TractorLottie.jsx").then((m) => ({ default: m.TractorLottie }))
);

const SPLASH_MS = 5000;
const REDUCED_MS = 900;

/**
 * Farm splash: realistic field photo + tractor/farmer work animation.
 * Shown once per browser tab session (~4–5s).
 */
export function SplashScreen({ onFinish }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? REDUCED_MS : SPLASH_MS;
    const fadeAt = Math.max(total - 550, total * 0.82);

    const fadeTimer = window.setTimeout(() => setExiting(true), fadeAt);
    const doneTimer = window.setTimeout(() => onFinish?.(), total);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-screen fixed inset-0 z-[200] flex flex-col items-center justify-end overflow-hidden sm:justify-center ${
        exiting ? "splash-screen--exit" : ""
      }`}
      role="dialog"
      aria-label="PakFasal"
      aria-busy="true"
    >
      <div className="splash-farm-bg absolute inset-0" aria-hidden>
        <img
          src="/splash/farm-hero.jpg"
          alt=""
          className="splash-farm-photo h-full w-full object-cover"
          draggable={false}
        />
        <div className="splash-farm-veil absolute inset-0" />
        <div className="splash-farm-glow absolute inset-0" />
      </div>

      <div className="splash-stage relative z-10 flex w-full max-w-lg flex-col items-center px-5 pb-14 pt-10 text-center sm:pb-10">
        <div className="splash-farm-stage mb-4 w-full sm:mb-5">
          <Suspense
            fallback={
              <div className="flex h-[240px] items-center justify-center md:h-[300px]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            }
          >
            <TractorLottie className="splash-tractor" size="splash" />
          </Suspense>
        </div>

        <div className="splash-brand-chip mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur-md">
          <svg
            className="h-5 w-5"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect width="32" height="32" rx="6" fill="#059669" />
            <path
              fill="#fff"
              d="M8 20c2-6 6-10 8-12 2 2 4 6 4 10 0 4-2 6-4 6s-3-2-3-4c0-1 0-2 1-3-2 2-3 5-3 8v3H8v-8z"
            />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/95">
            Farm to admin
          </span>
        </div>

        <h1 className="splash-title font-en text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          PakFasal
        </h1>
        <p className="splash-tagline mt-2 max-w-sm text-sm font-medium text-emerald-50/95 sm:text-base">
          Farmer ke khet se — smart farming for Pakistan
        </p>

        <div className="splash-bar mt-8 h-1.5 w-44 overflow-hidden rounded-full bg-white/20 sm:w-52">
          <div className="splash-bar__fill h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-teal-200" />
        </div>
      </div>
    </div>
  );
}
