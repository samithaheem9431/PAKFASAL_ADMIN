/**
 * Login hero: farmer driving a tractor on a grassy farm road.
 * Pure SVG + CSS — no CDN / Lottie dependency.
 */
export function TractorLottie({ className = "" }) {
  return (
    <div
      className={`tractor-scene flex justify-center ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 480 280"
        className="mx-auto h-[210px] w-full max-w-[360px] md:h-[270px] md:max-w-[400px]"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8e0f0" />
            <stop offset="55%" stopColor="#d9f0e3" />
            <stop offset="100%" stopColor="#c8e6c9" />
          </linearGradient>
          <linearGradient id="fieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7cb342" />
            <stop offset="100%" stopColor="#558b2f" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8d6e63" />
            <stop offset="40%" stopColor="#6d4c41" />
            <stop offset="100%" stopColor="#5d4037" />
          </linearGradient>
          <linearGradient id="tractorBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#1b5e20" />
          </linearGradient>
          <linearGradient id="hoodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          <clipPath id="roadClip">
            <path d="M0 198 H480 V268 H0 Z" />
          </clipPath>
        </defs>

        {/* Sky */}
        <rect width="480" height="280" fill="url(#skyGrad)" />

        {/* Soft clouds */}
        <g className="tractor-scene__clouds" opacity="0.55">
          <ellipse cx="70" cy="48" rx="36" ry="14" fill="#fff" />
          <ellipse cx="95" cy="44" rx="22" ry="12" fill="#fff" />
          <ellipse cx="340" cy="38" rx="40" ry="15" fill="#fff" />
          <ellipse cx="370" cy="36" rx="24" ry="11" fill="#fff" />
        </g>

        {/* Distant hills / crops */}
        <path
          d="M0 170 C60 145 110 155 160 148 C210 140 250 160 300 150 C360 138 420 155 480 142 V200 H0 Z"
          fill="url(#fieldGrad)"
          opacity="0.85"
        />
        <g opacity="0.45">
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 12 + i * 27;
            return (
              <path
                key={i}
                className="tractor-scene__crop"
                style={{ animationDelay: `${(i % 5) * 0.15}s` }}
                d={`M${x} 168 Q${x - 2} 155 ${x} 148 Q${x + 2} 155 ${x} 168`}
                fill="#33691e"
              />
            );
          })}
        </g>

        {/* Grassy roadside strips */}
        <path
          d="M0 198 C80 190 160 204 240 196 C320 188 400 202 480 194 V230 H0 Z"
          fill="#66bb6a"
        />
        <path
          d="M0 210 C90 202 170 218 260 208 C350 198 410 214 480 206 V248 H0 Z"
          fill="#43a047"
          opacity="0.9"
        />

        {/* Dirt road bed */}
        <path
          d="M0 218 C100 210 180 228 280 216 C370 206 420 224 480 214 V268 H0 Z"
          fill="url(#roadGrad)"
        />

        {/* Scrolling grass tufts on road edges */}
        <g clipPath="url(#roadClip)">
          <g className="tractor-scene__grass-scroll">
            {[0, 480].map((offset) => (
              <g key={offset} transform={`translate(${offset} 0)`}>
                {Array.from({ length: 16 }).map((_, i) => {
                  const x = 8 + i * 30;
                  const y = 208 + (i % 3) * 4;
                  return (
                    <g key={`${offset}-${i}`}>
                      <path
                        d={`M${x} ${y} L${x - 3} ${y - 14} L${x + 1} ${y - 6} L${x + 4} ${y - 16} L${x + 2} ${y}`}
                        fill="#388e3c"
                      />
                      <path
                        d={`M${x + 14} ${y + 28} L${x + 11} ${y + 16} L${x + 15} ${y + 22} L${x + 18} ${y + 14} L${x + 16} ${y + 28}`}
                        fill="#2e7d32"
                      />
                    </g>
                  );
                })}
                {/* Road texture stones */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <ellipse
                    key={`stone-${offset}-${i}`}
                    cx={20 + i * 48}
                    cy={238 + (i % 2) * 8}
                    rx={5 + (i % 3)}
                    ry={2.5}
                    fill="#4e342e"
                    opacity="0.35"
                  />
                ))}
                {/* Center dashed track marks */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect
                    key={`dash-${offset}-${i}`}
                    x={30 + i * 60}
                    y={242}
                    width="28"
                    height="3"
                    rx="1.5"
                    fill="#3e2723"
                    opacity="0.25"
                  />
                ))}
              </g>
            ))}
          </g>
        </g>

        {/* Tractor + farmer group (gentle bounce) */}
        <g transform="translate(118 118)">
          <g className="tractor-scene__rig">
          {/* Exhaust puff */}
          <g opacity="0.35">
            <g className="tractor-scene__smoke">
              <circle cx="28" cy="8" r="5" fill="#90a4ae" />
              <circle cx="18" cy="-2" r="7" fill="#b0bec5" />
              <circle cx="8" cy="-10" r="5" fill="#cfd8dc" />
            </g>
          </g>

          {/* Exhaust pipe */}
          <rect x="32" y="22" width="6" height="28" rx="2" fill="#455a64" />
          <rect x="31" y="18" width="8" height="8" rx="2" fill="#37474f" />

          {/* Rear fender / body */}
          <path
            d="M40 78 C40 52 52 40 78 38 L118 38 L118 95 L48 95 C42 95 40 90 40 78 Z"
            fill="url(#tractorBody)"
          />
          <path
            d="M48 48 H110 V58 H48 Z"
            fill="#1b5e20"
            opacity="0.35"
          />

          {/* Cab frame */}
          <path
            d="M72 18 H112 V52 H72 Z"
            fill="#c8e6c9"
            stroke="#1b5e20"
            strokeWidth="3"
            opacity="0.95"
          />
          <path d="M74 20 H90 V50 H74 Z" fill="#81d4fa" opacity="0.55" />
          <path d="M92 20 H110 V50 H92 Z" fill="#4fc3f7" opacity="0.35" />
          <line
            x1="91"
            y1="18"
            x2="91"
            y2="52"
            stroke="#1b5e20"
            strokeWidth="2.5"
          />

          {/* Hood */}
          <path
            d="M118 48 L168 52 L172 78 L118 82 Z"
            fill="url(#hoodGrad)"
          />
          <path
            d="M120 54 L164 57 L166 68 L120 70 Z"
            fill="#66bb6a"
            opacity="0.5"
          />
          {/* Headlight */}
          <ellipse cx="170" cy="66" rx="5" ry="4" fill="#fff59d" />
          <ellipse cx="170" cy="66" rx="3" ry="2.5" fill="#fffde7" />

          {/* Front axle housing */}
          <rect x="148" y="78" width="28" height="14" rx="3" fill="#33691e" />

          {/* Seat */}
          <path
            d="M78 52 C78 44 86 40 96 42 C104 44 108 50 108 56 L80 56 Z"
            fill="#37474f"
          />
          <rect x="78" y="54" width="30" height="8" rx="2" fill="#263238" />

          {/* ——— Farmer ——— */}
          <g className="tractor-scene__farmer">
            {/* Legs / torso in seat */}
            <path
              d="M84 56 C86 64 90 70 98 72 L104 58 Z"
              fill="#5d4037"
            />
            {/* Body / shirt */}
            <path
              d="M86 36 C88 28 98 26 106 30 C110 34 110 44 106 50 L90 52 C86 48 84 42 86 36 Z"
              fill="#ef6c00"
            />
            {/* Arms on steering */}
            <path
              d="M104 40 C118 38 128 48 130 56"
              fill="none"
              stroke="#ffcc80"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M92 44 C100 48 112 52 124 56"
              fill="none"
              stroke="#ffcc80"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Hands */}
            <circle cx="130" cy="56" r="4.5" fill="#ffcc80" />
            {/* Neck */}
            <rect x="96" y="28" width="8" height="8" rx="2" fill="#ffcc80" />
            {/* Head */}
            <circle cx="100" cy="22" r="11" fill="#ffcc80" />
            {/* Cap */}
            <path
              d="M88 18 C90 10 110 10 112 18 L112 22 H88 Z"
              fill="#1565c0"
            />
            <ellipse cx="112" cy="20" rx="8" ry="3" fill="#0d47a1" />
            {/* Eye */}
            <circle cx="104" cy="22" r="1.4" fill="#3e2723" />
            {/* Smile */}
            <path
              d="M102 26 Q106 28 108 25"
              fill="none"
              stroke="#6d4c41"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>

          {/* Steering wheel */}
          <ellipse
            cx="128"
            cy="56"
            rx="11"
            ry="5"
            fill="none"
            stroke="#263238"
            strokeWidth="3"
          />
          <line
            x1="118"
            y1="56"
            x2="138"
            y2="56"
            stroke="#263238"
            strokeWidth="2"
          />

          {/* Rear large wheel */}
          <g transform="translate(68 98)">
            <g className="tractor-scene__wheel-rear">
              <circle r="34" fill="#212121" />
              <circle r="28" fill="#424242" />
              <circle r="14" fill="#757575" />
              <circle r="6" fill="#bdbdbd" />
              {[0, 45, 90, 135].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={Math.cos((deg * Math.PI) / 180) * 26}
                  y2={Math.sin((deg * Math.PI) / 180) * 26}
                  stroke="#616161"
                  strokeWidth="3"
                />
              ))}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return (
                  <rect
                    key={i}
                    x={Math.cos(a) * 30 - 3}
                    y={Math.sin(a) * 30 - 4}
                    width="6"
                    height="8"
                    rx="1"
                    fill="#111"
                    transform={`rotate(${i * 30} ${Math.cos(a) * 30} ${Math.sin(a) * 30})`}
                  />
                );
              })}
            </g>
          </g>

          {/* Front smaller wheel */}
          <g transform="translate(162 108)">
            <g className="tractor-scene__wheel-front">
              <circle r="22" fill="#212121" />
              <circle r="17" fill="#424242" />
              <circle r="8" fill="#757575" />
              <circle r="4" fill="#bdbdbd" />
              {[0, 60, 120].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={Math.cos((deg * Math.PI) / 180) * 15}
                  y2={Math.sin((deg * Math.PI) / 180) * 15}
                  stroke="#616161"
                  strokeWidth="2.5"
                />
              ))}
            </g>
          </g>

          {/* Chassis bar */}
          <rect x="95" y="88" width="58" height="8" rx="2" fill="#1b5e20" />
          </g>
        </g>

        {/* Soft ground shadow under tractor */}
        <ellipse
          className="tractor-scene__shadow"
          cx="240"
          cy="252"
          rx="95"
          ry="8"
          fill="#3e2723"
          opacity="0.28"
        />
      </svg>
    </div>
  );
}
