/**
 * Login hero: farmer driving a tractor on a grassy farm road.
 * Pure SVG + CSS — no CDN / Lottie dependency.
 * Tractor silhouette / size kept stable; road + farmer refined for realism.
 */
export function TractorLottie({ className = "" }) {
  const grassTufts = (offset, yBase, count, step, fill) =>
    Array.from({ length: count }).map((_, i) => {
      const x = 6 + i * step;
      const y = yBase + (i % 4) * 2.5;
      const h = 11 + (i % 3) * 3;
      return (
        <path
          key={`${offset}-${yBase}-${i}`}
          className="tractor-scene__blade"
          style={{ animationDelay: `${(i % 6) * 0.12}s` }}
          d={`M${x} ${y}
            L${x - 3.5} ${y - h}
            L${x} ${y - h * 0.45}
            L${x + 2} ${y - h * 1.05}
            L${x + 1.2} ${y - h * 0.5}
            L${x + 4.5} ${y - h * 0.85}
            L${x + 2} ${y}`}
          fill={fill}
        />
      );
    });

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
            <stop offset="0%" stopColor="#a8d4e8" />
            <stop offset="50%" stopColor="#d4ebdf" />
            <stop offset="100%" stopColor="#c5e0b4" />
          </linearGradient>
          <linearGradient id="fieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8bc34a" />
            <stop offset="100%" stopColor="#558b2f" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ccc65" />
            <stop offset="35%" stopColor="#a1887f" />
            <stop offset="70%" stopColor="#8d6e63" />
            <stop offset="100%" stopColor="#6d4c41" />
          </linearGradient>
          <linearGradient id="grassEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7cb342" />
            <stop offset="100%" stopColor="#33691e" />
          </linearGradient>
          <linearGradient id="tractorBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#1b5e20" />
          </linearGradient>
          <linearGradient id="hoodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffcc80" />
            <stop offset="100%" stopColor="#e0a060" />
          </linearGradient>
          <clipPath id="roadClip">
            <path d="M0 188 H480 V275 H0 Z" />
          </clipPath>
        </defs>

        {/* Sky */}
        <rect width="480" height="280" fill="url(#skyGrad)" />

        {/* Soft clouds */}
        <g className="tractor-scene__clouds" opacity="0.5">
          <ellipse cx="70" cy="48" rx="36" ry="14" fill="#fff" />
          <ellipse cx="95" cy="44" rx="22" ry="12" fill="#fff" />
          <ellipse cx="340" cy="38" rx="40" ry="15" fill="#fff" />
          <ellipse cx="370" cy="36" rx="24" ry="11" fill="#fff" />
        </g>

        {/* Distant crop hills */}
        <path
          d="M0 170 C60 145 110 155 160 148 C210 140 250 160 300 150 C360 138 420 155 480 142 V200 H0 Z"
          fill="url(#fieldGrad)"
          opacity="0.88"
        />
        <g opacity="0.5">
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

        {/* Thick grassy verge (top edge of road) */}
        <path
          d="M0 188 C70 178 140 196 220 184 C300 172 380 192 480 180 V222 H0 Z"
          fill="url(#grassEdge)"
        />
        <path
          d="M0 200 C90 190 160 210 250 198 C340 186 410 206 480 194 V236 H0 Z"
          fill="#558b2f"
          opacity="0.85"
        />

        {/* Grassy dirt track bed */}
        <path
          d="M0 214 C95 204 175 226 275 212 C365 200 420 222 480 210 V275 H0 Z"
          fill="url(#roadGrad)"
        />
        {/* Worn twin tire ruts (grassy road feel) */}
        <path
          d="M0 228 C100 218 180 238 280 224 C370 214 425 232 480 222"
          fill="none"
          stroke="#5d4037"
          strokeWidth="10"
          opacity="0.28"
          strokeLinecap="round"
        />
        <path
          d="M0 246 C110 236 190 256 290 242 C375 232 430 250 480 240"
          fill="none"
          stroke="#4e342e"
          strokeWidth="9"
          opacity="0.22"
          strokeLinecap="round"
        />

        {/* Scrolling grass + road detail */}
        <g clipPath="url(#roadClip)">
          <g className="tractor-scene__grass-scroll">
            {[0, 480].map((offset) => (
              <g key={offset} transform={`translate(${offset} 0)`}>
                {/* Dense roadside grass — near side */}
                {grassTufts(offset, 206, 20, 24, "#2e7d32")}
                {grassTufts(offset, 214, 18, 26, "#388e3c")}
                {/* Far-side / mid verge blades */}
                {grassTufts(offset, 198, 14, 34, "#43a047")}
                {/* Sparse grass poking through the track */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const x = 18 + i * 40;
                  const y = 232 + (i % 3) * 6;
                  return (
                    <path
                      key={`mid-${offset}-${i}`}
                      d={`M${x} ${y} L${x - 2} ${y - 9} L${x + 1} ${y - 4} L${x + 3} ${y - 10} L${x + 1.5} ${y}`}
                      fill="#689f38"
                      opacity="0.7"
                    />
                  );
                })}
                {/* Small stones / dirt clods */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <ellipse
                    key={`stone-${offset}-${i}`}
                    cx={24 + i * 46}
                    cy={240 + (i % 2) * 10}
                    rx={4 + (i % 3)}
                    ry={2}
                    fill="#4e342e"
                    opacity="0.3"
                  />
                ))}
                {/* Soft tire print dashes */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <g key={`print-${offset}-${i}`} opacity="0.2">
                    <rect
                      x={28 + i * 68}
                      y={230}
                      width="22"
                      height="4"
                      rx="2"
                      fill="#3e2723"
                    />
                    <rect
                      x={34 + i * 68}
                      y={248}
                      width="20"
                      height="3.5"
                      rx="1.5"
                      fill="#3e2723"
                    />
                  </g>
                ))}
              </g>
            ))}
          </g>
        </g>

        {/* Soft ground shadow under tractor (behind wheels feel) */}
        <ellipse
          className="tractor-scene__shadow"
          cx="240"
          cy="255"
          rx="98"
          ry="9"
          fill="#3e2723"
          opacity="0.3"
        />

        {/* Tractor + farmer — same size / placement */}
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
            <path d="M48 48 H110 V58 H48 Z" fill="#1b5e20" opacity="0.35" />

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

            {/* ——— Farmer driving ——— */}
            <g className="tractor-scene__farmer">
              {/* Legs in seat */}
              <path
                d="M84 56 C87 66 92 74 100 76 L106 60 Z"
                fill="#4e342e"
              />
              <path
                d="M90 58 C94 68 98 74 104 75 L108 62 Z"
                fill="#3e2723"
                opacity="0.55"
              />
              {/* Torso / kurta */}
              <path
                d="M85 34 C88 26 100 24 108 29 C112 34 111 46 107 52 L88 54 C84 48 82 40 85 34 Z"
                fill="#ef6c00"
              />
              <path
                d="M90 36 H104 V48 H90 Z"
                fill="#e65100"
                opacity="0.35"
              />
              {/* Arms reaching steering */}
              <path
                d="M105 38 C116 36 124 44 129 54"
                fill="none"
                stroke="#ffb74d"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M90 42 C100 46 112 52 125 56"
                fill="none"
                stroke="#ffcc80"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Hands on wheel */}
              <circle cx="129" cy="55" r="4.8" fill="#ffb74d" />
              <circle cx="125" cy="56" r="4" fill="#ffcc80" />
              {/* Neck */}
              <rect x="96" y="27" width="8" height="9" rx="2" fill="#ffcc80" />
              {/* Head */}
              <circle cx="100" cy="21" r="11.5" fill="url(#skinGrad)" />
              {/* Ear */}
              <ellipse cx="90" cy="22" rx="2.5" ry="3" fill="#e0a060" />
              {/* Cap / topi */}
              <path
                d="M87 17 C90 8 111 8 113 17 L113 21 H87 Z"
                fill="#1565c0"
              />
              <ellipse cx="113" cy="19.5" rx="8.5" ry="3.2" fill="#0d47a1" />
              {/* Eye + brow */}
              <path
                d="M100 18 H108"
                stroke="#5d4037"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="104" cy="21.5" r="1.5" fill="#3e2723" />
              <circle cx="104.5" cy="21" r="0.5" fill="#fff" />
              {/* Smile */}
              <path
                d="M101 25.5 Q105 28 109 24.5"
                fill="none"
                stroke="#6d4c41"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>

            {/* Steering wheel (in front of hands visually) */}
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

            {/* Rear large wheel — unchanged size */}
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

            {/* Front smaller wheel — unchanged size */}
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

        {/* Foreground grass blades (in front of tires for depth) */}
        <g clipPath="url(#roadClip)" pointerEvents="none">
          <g className="tractor-scene__grass-scroll">
            {[0, 480].map((offset) => (
              <g key={`fg-${offset}`} transform={`translate(${offset} 0)`}>
                {Array.from({ length: 10 }).map((_, i) => {
                  const x = 40 + i * 48;
                  const y = 262;
                  return (
                    <path
                      key={i}
                      className="tractor-scene__blade"
                      style={{ animationDelay: `${(i % 4) * 0.18}s` }}
                      d={`M${x} ${y}
                        L${x - 4} ${y - 16}
                        L${x} ${y - 7}
                        L${x + 3} ${y - 18}
                        L${x + 1} ${y - 8}
                        L${x + 5} ${y - 14}
                        L${x + 2} ${y}`}
                      fill="#1b5e20"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
