import { useEffect, useState } from "react";

const SPLASH_MS = 4500;
const REDUCED_MS = 900;

const PARTICLES = [
  { left: "8%", top: "18%", delay: "0s", size: 10, depth: "near" },
  { left: "78%", top: "14%", delay: "0.4s", size: 14, depth: "far" },
  { left: "16%", top: "72%", delay: "0.8s", size: 12, depth: "mid" },
  { left: "86%", top: "68%", delay: "1.1s", size: 9, depth: "near" },
  { left: "48%", top: "10%", delay: "0.2s", size: 8, depth: "far" },
  { left: "62%", top: "80%", delay: "1.4s", size: 11, depth: "mid" },
  { left: "28%", top: "42%", delay: "0.6s", size: 7, depth: "far" },
  { left: "72%", top: "38%", delay: "1.7s", size: 13, depth: "near" },
];

/**
 * Full-screen PakFasal intro with a CSS 3D scene — once per tab session.
 */
export function SplashScreen({ onFinish }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? REDUCED_MS : SPLASH_MS;
    const fadeAt = Math.max(total - 500, total * 0.78);

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
        <div className="splash-grid" />
      </div>

      <div className="splash-stage relative z-10 flex flex-col items-center px-6 text-center">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`splash-particle splash-particle--${p.depth}`}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
            aria-hidden
          />
        ))}

        <div className="splash-scene mb-7 sm:mb-8">
          <div className="splash-floor" aria-hidden />
          <div className="splash-ring" aria-hidden />
          <div className="splash-logo-card">
            <div className="splash-logo-shine" aria-hidden />
            <svg
              className="splash-logo relative z-[1] h-[52px] w-[52px] sm:h-[64px] sm:w-[64px]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                fill="#fff"
                d="M8 20c2-6 6-10 8-12 2 2 4 6 4 10 0 4-2 6-4 6s-3-2-3-4c0-1 0-2 1-3-2 2-3 5-3 8v3H8v-8z"
              />
            </svg>
          </div>
        </div>

        <h1 className="splash-title font-en text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          PakFasal
        </h1>
        <p className="splash-tagline mt-2.5 max-w-xs text-sm font-medium text-brand-700/90 sm:text-base">
          Smart farming for Pakistan
        </p>

        <div className="splash-bar mt-10 h-1.5 w-40 overflow-hidden rounded-full bg-brand-900/15 sm:w-52">
          <div className="splash-bar__fill h-full rounded-full bg-gradient-to-r from-brand-600 via-emerald-400 to-teal-500" />
        </div>
      </div>
    </div>
  );
}
