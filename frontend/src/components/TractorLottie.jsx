import { useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import fallbackAnimation from "../assets/lottie/tractor.json";

/**
 * Hero animation for admin login:
 * 1) Optional `VITE_HERO_LOTTIE_URL` (.lottie or .json)
 * 2) LottieFiles “Tractor Animation” (Mohit) — proper tractor
 * 3) LottieFiles “Wheat in Wind” — فصل / crop feel
 * 4) Bundled fallback if CDN is blocked (offline / firewall)
 * Road strip sits under the Lottie so the tractor reads as driving.
 */
const TRACTOR_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/e3b38514-1150-11ee-9dde-3789514b5871/ZNdbOpdPyr.lottie";
const WHEAT_FASAL_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/fa3519dc-1179-11ee-9c25-7327e7ecf09c/nfp5owc8Aq.lottie";

function TractorRoad() {
  return (
    <svg
      className="tractor-road -mt-12 w-full max-w-[360px] md:-mt-14 md:max-w-[400px]"
      viewBox="0 0 400 56"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roadBed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a1887f" />
          <stop offset="55%" stopColor="#8d6e63" />
          <stop offset="100%" stopColor="#6d4c41" />
        </linearGradient>
        <linearGradient id="roadGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cb342" />
          <stop offset="100%" stopColor="#558b2f" />
        </linearGradient>
      </defs>

      {/* Grass verges */}
      <path
        d="M0 18 C40 10 80 22 120 14 C160 6 200 20 240 12 C280 4 320 18 360 10 C380 6 400 12 400 12 V28 H0 Z"
        fill="url(#roadGrass)"
      />
      <path
        d="M0 40 H400 V56 H0 Z"
        fill="#558b2f"
        opacity="0.9"
      />

      {/* Dirt road bed */}
      <path
        d="M0 22 C50 16 100 28 150 20 C200 12 250 26 300 18 C340 12 370 24 400 20 V46 H0 Z"
        fill="url(#roadBed)"
      />

      {/* Twin tire ruts */}
      <path
        d="M0 30 C60 24 110 34 170 28 C230 22 290 34 350 28 C375 26 400 30 400 30"
        fill="none"
        stroke="#5d4037"
        strokeWidth="3.5"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M0 38 C55 32 120 42 180 36 C240 30 300 42 360 36 C380 34 400 38 400 38"
        fill="none"
        stroke="#4e342e"
        strokeWidth="3"
        opacity="0.28"
        strokeLinecap="round"
      />

      {/* Scrolling dashed center line */}
      <g className="tractor-road__scroll">
        {[0, 400].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={18 + i * 50}
                y={32}
                width="22"
                height="3"
                rx="1.5"
                fill="#efebe9"
                opacity="0.55"
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

export function TractorLottie({ className = "", size = "default", showRoad = true }) {
  const sources = useMemo(() => {
    const env = import.meta.env.VITE_HERO_LOTTIE_URL;
    const list = [];
    if (env && String(env).trim()) list.push(String(env).trim());
    list.push(TRACTOR_DOTLOTTIE, WHEAT_FASAL_DOTLOTTIE);
    return [...new Set(list)];
  }, []);

  const [index, setIndex] = useState(0);
  const [useBundled, setUseBundled] = useState(false);

  const src = sources[index];

  const handleDotLottie = (instance) => {
    if (!instance) return;
    const onLoadError = () => {
      instance.removeEventListener("loadError", onLoadError);
      setIndex((i) => {
        const next = i + 1;
        if (next >= sources.length) {
          setUseBundled(true);
          return i;
        }
        return next;
      });
    };
    instance.addEventListener("loadError", onLoadError);
  };

  const lottieClass =
    size === "splash"
      ? "mx-auto h-[240px] w-full max-w-[400px] md:h-[300px] md:max-w-[460px]"
      : "mx-auto h-[210px] w-full max-w-[360px] md:h-[270px] md:max-w-[400px]";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {!useBundled ? (
        <DotLottieReact
          key={`${src}-${index}`}
          src={src}
          loop
          autoplay
          dotLottieRefCallback={handleDotLottie}
          className={lottieClass}
          style={{ width: "100%" }}
          aria-hidden
        />
      ) : (
        <DotLottieReact
          key="bundled-fallback"
          data={JSON.stringify(fallbackAnimation)}
          loop
          autoplay
          className={lottieClass}
          style={{ width: "100%" }}
          aria-hidden
        />
      )}
      {showRoad ? <TractorRoad /> : null}
    </div>
  );
}
