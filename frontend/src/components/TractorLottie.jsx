import { useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import fallbackAnimation from "../assets/lottie/tractor.json";

/**
 * Hero animation for admin login:
 * 1) Optional `VITE_HERO_LOTTIE_URL` (.lottie or .json)
 * 2) LottieFiles “Tractor Animation” (Mohit) — proper tractor
 * 3) LottieFiles “Wheat in Wind” — فصل / crop feel
 * 4) Bundled fallback if CDN is blocked (offline / firewall)
 * Road strip + SVG farmer overlay sit with the Lottie so it reads as driving.
 */
const TRACTOR_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/e3b38514-1150-11ee-9dde-3789514b5871/ZNdbOpdPyr.lottie";
const WHEAT_FASAL_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/fa3519dc-1179-11ee-9c25-7327e7ecf09c/nfp5owc8Aq.lottie";

function TractorFarmer() {
  return (
    <svg
      className="tractor-farmer pointer-events-none absolute z-[1]"
      viewBox="0 0 72 90"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="farmerSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffcc80" />
          <stop offset="100%" stopColor="#e0a060" />
        </linearGradient>
      </defs>

      {/* Legs in seat */}
      <path d="M28 58 C32 70 38 78 48 80 L52 62 Z" fill="#4e342e" />
      <path d="M34 60 C38 72 42 78 50 79 L54 64 Z" fill="#3e2723" opacity="0.55" />

      {/* Torso / kurta */}
      <path
        d="M26 34 C30 24 44 22 52 28 C56 34 55 48 50 56 L28 58 C24 50 22 40 26 34 Z"
        fill="#ef6c00"
      />
      <path d="M32 36 H48 V50 H32 Z" fill="#e65100" opacity="0.35" />

      {/* Arms toward steering */}
      <path
        d="M48 40 C58 38 64 46 68 56"
        fill="none"
        stroke="#ffb74d"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M32 44 C42 48 54 54 66 58"
        fill="none"
        stroke="#ffcc80"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="68" cy="56" r="4" fill="#ffb74d" />
      <circle cx="65" cy="58" r="3.5" fill="#ffcc80" />

      {/* Neck + head */}
      <rect x="38" y="24" width="8" height="10" rx="2" fill="#ffcc80" />
      <circle cx="42" cy="18" r="11" fill="url(#farmerSkin)" />
      <ellipse cx="32" cy="19" rx="2.2" ry="2.8" fill="#e0a060" />

      {/* Cap / topi */}
      <path d="M30 14 C34 4 52 4 54 14 L54 18 H30 Z" fill="#1565c0" />
      <ellipse cx="54" cy="16.5" rx="7.5" ry="2.8" fill="#0d47a1" />

      {/* Face */}
      <path
        d="M42 15 H50"
        stroke="#5d4037"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="46" cy="18.5" r="1.4" fill="#3e2723" />
      <circle cx="46.5" cy="18" r="0.45" fill="#fff" />
      <path
        d="M43 22.5 Q47 25 51 22"
        fill="none"
        stroke="#6d4c41"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <path d="M0 40 H400 V56 H0 Z" fill="#558b2f" opacity="0.9" />

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

export function TractorLottie({ className = "" }) {
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
  const showFarmer = useBundled || src !== WHEAT_FASAL_DOTLOTTIE;

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
    "mx-auto h-[210px] w-full max-w-[360px] md:h-[270px] md:max-w-[400px]";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${lottieClass}`}>
        {!useBundled ? (
          <DotLottieReact
            key={`${src}-${index}`}
            src={src}
            loop
            autoplay
            dotLottieRefCallback={handleDotLottie}
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
            aria-hidden
          />
        ) : (
          <DotLottieReact
            key="bundled-fallback"
            data={JSON.stringify(fallbackAnimation)}
            loop
            autoplay
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
            aria-hidden
          />
        )}
        {showFarmer ? <TractorFarmer /> : null}
      </div>
      <TractorRoad />
    </div>
  );
}
