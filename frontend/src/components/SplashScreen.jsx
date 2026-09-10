import { useEffect, useState } from "react";

const SPLASH_MS = 4000;
const REDUCED_MS = 900;

/**
 * Full-screen PakFasal intro shown once per browser tab session.
 */
export function SplashScreen({ onFinish }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? REDUCED_MS : SPLASH_MS;
    const fadeAt = Math.max(total - 450, total * 0.75);

    const fadeTimer = window.setTimeout(() => setExiting(true), fadeAt);
    const doneTimer = window.setTimeout(() => onFinish?.(), total);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-screen fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-auth-hero ${
        exiting ? "splash-screen--exit" : ""
      }`}
      role="dialog"
      aria-label="PakFasal"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="splash-orb splash-orb--a" />
        <div className="splash-orb splash-orb--b" />
        <div className="splash-orb splash-orb--c" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="splash-logo-wrap mb-6">
          <img
            src="/favicon.svg"
            alt=""
            width={88}
            height={88}
            className="splash-logo h-[72px] w-[72px] drop-shadow-lg sm:h-[88px] sm:w-[88px]"
            draggable={false}
          />
        </div>

        <h1 className="splash-title font-en text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          PakFasal
        </h1>
        <p className="splash-tagline mt-2 max-w-xs text-sm font-medium text-brand-700/90 sm:text-base">
          Smart farming for Pakistan
        </p>

        <div className="splash-bar mt-10 h-1 w-36 overflow-hidden rounded-full bg-brand-900/15 sm:w-44">
          <div className="splash-bar__fill h-full rounded-full bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500" />
        </div>
      </div>
    </div>
  );
}
