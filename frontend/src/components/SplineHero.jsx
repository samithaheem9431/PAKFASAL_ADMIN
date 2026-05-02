import { Suspense, lazy } from "react";
import { Spinner } from "./Spinner.jsx";

const Spline = lazy(() => import("@splinetool/react-spline"));

/**
 * Optional interactive 3D (Spline). Set `VITE_SPLINE_SCENE_URL` to your scene’s
 * public URL from spline.design (…/scene.splinecode).
 */
export function SplineHero({ className = "" }) {
  const scene = import.meta.env.VITE_SPLINE_SCENE_URL?.trim();
  if (!scene) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ring-1 ring-white/40 shadow-xl shadow-emerald-900/10 ${className}`}
    >
      <Suspense
        fallback={
          <div className="flex min-h-[240px] items-center justify-center bg-white/30 backdrop-blur-sm md:min-h-[280px]">
            <Spinner className="h-10 w-10 text-brand-600" />
          </div>
        }
      >
        <Spline
          scene={scene}
          className="min-h-[240px] w-full md:min-h-[280px]"
        />
      </Suspense>
    </div>
  );
}
