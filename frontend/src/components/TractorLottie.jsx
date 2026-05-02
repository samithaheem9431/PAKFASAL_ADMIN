import { useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import fallbackAnimation from "../assets/lottie/tractor.json";

/**
 * Hero animation for admin login:
 * 1) Optional `VITE_HERO_LOTTIE_URL` (.lottie or .json)
 * 2) LottieFiles “Tractor Animation” (Mohit) — proper tractor
 * 3) LottieFiles “Wheat in Wind” — فصل / crop feel
 * 4) Bundled fallback if CDN is blocked (offline / firewall)
 */
const TRACTOR_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/e3b38514-1150-11ee-9dde-3789514b5871/ZNdbOpdPyr.lottie";
const WHEAT_FASAL_DOTLOTTIE =
  "https://assets-v2.lottiefiles.com/a/fa3519dc-1179-11ee-9c25-7327e7ecf09c/nfp5owc8Aq.lottie";

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

  return (
    <div className={`flex justify-center ${className}`}>
      {!useBundled ? (
        <DotLottieReact
          key={`${src}-${index}`}
          src={src}
          loop
          autoplay
          dotLottieRefCallback={handleDotLottie}
          className="mx-auto h-[210px] w-full max-w-[360px] md:h-[270px] md:max-w-[400px]"
          style={{ width: "100%" }}
          aria-hidden
        />
      ) : (
        <DotLottieReact
          key="bundled-fallback"
          data={JSON.stringify(fallbackAnimation)}
          loop
          autoplay
          className="mx-auto h-[210px] w-full max-w-[360px] md:h-[270px] md:max-w-[400px]"
          style={{ width: "100%" }}
          aria-hidden
        />
      )}
    </div>
  );
}
