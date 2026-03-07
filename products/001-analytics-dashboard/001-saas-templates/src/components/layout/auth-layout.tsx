import { Outlet } from "react-router-dom"
import { PageTransition } from "@/components/page-transition"

/* ── ShopPulse diamond logo (matches header/sidebar branding) ── */
export function ShopPulseLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} width={size} height={size}>
      <path
        d="M14 3L24 10L14 25L4 10Z"
        fill="url(#authGrd)"
        fillOpacity="0.5"
        stroke="url(#authGrd)"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <path d="M14 7L20 11.5L14 22L8 11.5Z" fill="url(#authGrd)" fillOpacity="0.85" />
      <defs>
        <linearGradient id="authGrd" x1="4" y1="3" x2="24" y2="25">
          <stop stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Premium dashboard illustration — full mockup with glass UI ── */
function AuthIllustration() {
  return (
    <div className="relative w-full max-w-[440px]" style={{ aspectRatio: "11/9" }}>
      {/* Ambient glow layers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.12] blur-[80px]" />
      <div className="absolute bottom-1/4 right-0 w-[200px] h-[160px] rounded-full bg-indigo-400/[0.08] blur-[60px]" />

      <svg viewBox="0 0 480 400" fill="none" className="relative w-full h-full drop-shadow-2xl">
        <defs>
          {/* Glass card fills */}
          <linearGradient id="glassMain" x1="0" y1="0" x2="480" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="glassSidebar" x1="0" y1="0" x2="0" y2="400">
            <stop stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="glassCard" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
          </linearGradient>
          {/* Chart gradients */}
          <linearGradient id="barV" x1="0" y1="1" x2="0" y2="0">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="barV2" x1="0" y1="1" x2="0" y2="0">
            <stop stopColor="#6d28d9" stopOpacity="0.5" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="donutG1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="donutG2" x1="1" y1="0" x2="0" y2="1">
            <stop stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#e9d5ff" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="0" y1="1" x2="0" y2="0">
            <stop stopColor="#22c55e" stopOpacity="0" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0.5" />
          </linearGradient>
          {/* Clip for main window */}
          <clipPath id="mainClip">
            <rect x="16" y="16" width="448" height="368" rx="16" />
          </clipPath>
        </defs>

        {/* ══════════ MAIN WINDOW FRAME ══════════ */}
        <rect x="16" y="16" width="448" height="368" rx="16" fill="url(#glassMain)" stroke="#c4b5fd" strokeOpacity="0.12" strokeWidth="1" />

        {/* Window title bar */}
        <rect x="16" y="16" width="448" height="32" rx="16" fill="#ffffff" fillOpacity="0.03" />
        <rect x="16" y="36" width="448" height="12" fill="#ffffff" fillOpacity="0.03" />
        {/* Traffic lights */}
        <circle cx="36" cy="32" r="4" fill="#ef4444" fillOpacity="0.7" />
        <circle cx="50" cy="32" r="4" fill="#f59e0b" fillOpacity="0.7" />
        <circle cx="64" cy="32" r="4" fill="#22c55e" fillOpacity="0.7" />

        <g clipPath="url(#mainClip)">

        {/* ══════════ SIDEBAR ══════════ */}
        <rect x="16" y="48" width="80" height="336" fill="url(#glassSidebar)" />
        <line x1="96" y1="48" x2="96" y2="384" stroke="#c4b5fd" strokeOpacity="0.08" strokeWidth="1" />

        {/* Sidebar logo */}
        <rect x="32" y="60" width="28" height="28" rx="8" fill="#7c3aed" fillOpacity="0.4" />
        <path d="M46 67L52 72L46 80L40 72Z" fill="#c4b5fd" fillOpacity="0.9" />

        {/* Sidebar nav items */}
        <rect x="28" y="102" width="56" height="28" rx="6" fill="#7c3aed" fillOpacity="0.2" />
        <rect x="36" y="112" width="18" height="3" rx="1.5" fill="#a78bfa" fillOpacity="0.8" />
        <rect x="36" y="118" width="12" height="2" rx="1" fill="#a78bfa" fillOpacity="0.4" />

        {[140, 172, 204, 236].map((y) => (
          <g key={y}>
            <rect x="36" y={y + 6} width="16" height="3" rx="1.5" fill="#c4b5fd" fillOpacity="0.2" />
            <rect x="36" y={y + 12} width="10" height="2" rx="1" fill="#c4b5fd" fillOpacity="0.1" />
          </g>
        ))}

        {/* Sidebar user avatar */}
        <circle cx="56" cy="360" r="12" fill="#7c3aed" fillOpacity="0.3" stroke="#a78bfa" strokeOpacity="0.2" strokeWidth="1" />
        <circle cx="56" cy="356" r="4" fill="#c4b5fd" fillOpacity="0.5" />
        <path d="M47 367 Q56 362 65 367" fill="#c4b5fd" fillOpacity="0.3" />

        {/* ══════════ MAIN CONTENT AREA ══════════ */}

        {/* Top bar / breadcrumb */}
        <rect x="110" y="56" width="60" height="6" rx="3" fill="#c4b5fd" fillOpacity="0.15" />
        <rect x="180" y="56" width="40" height="6" rx="3" fill="#c4b5fd" fillOpacity="0.08" />

        {/* ── ROW 1: KPI Cards (3 cards) ── */}
        {/* KPI 1 — Revenue */}
        <g style={{ animation: "float 7s ease-in-out infinite" }}>
          <rect x="110" y="74" width="108" height="62" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.15" strokeWidth="0.5" />
          <rect x="122" y="86" width="36" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.25" />
          <text x="122" y="108" fill="#e9d5ff" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans, system-ui">$48.5K</text>
          {/* Mini sparkline */}
          <polyline points="122,124 130,120 138,122 146,116 154,118 162,112 170,114 178,108 186,110 194,104" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
          </polyline>
          {/* Green badge */}
          <rect x="168" y="84" width="36" height="14" rx="7" fill="#22c55e" fillOpacity="0.15" />
          <text x="178" y="94" fill="#4ade80" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui">+12.5%</text>
        </g>

        {/* KPI 2 — Orders */}
        <g style={{ animation: "float 7s ease-in-out 0.5s infinite" }}>
          <rect x="226" y="74" width="108" height="62" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.15" strokeWidth="0.5" />
          <rect x="238" y="86" width="30" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.25" />
          <text x="238" y="108" fill="#e9d5ff" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans, system-ui">1,284</text>
          {/* Mini bar sparkline */}
          {[238, 246, 254, 262, 270, 278, 286, 294, 302].map((bx, bi) => (
            <rect key={bx} x={bx} y={124 - (8 + bi * 1.2)} width="5" height={8 + bi * 1.2} rx="1" fill="#818cf8" fillOpacity={0.3 + bi * 0.06}>
              <animate attributeName="height" values={`${6 + bi};${10 + bi * 1.2};${6 + bi}`} dur="3s" begin={`${bi * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}
          <rect x="284" y="84" width="36" height="14" rx="7" fill="#818cf8" fillOpacity="0.15" />
          <text x="294" y="94" fill="#a78bfa" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui">+8.3%</text>
        </g>

        {/* KPI 3 — Conversion */}
        <g style={{ animation: "float 7s ease-in-out 1s infinite" }}>
          <rect x="342" y="74" width="108" height="62" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.15" strokeWidth="0.5" />
          <rect x="354" y="86" width="42" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.25" />
          <text x="354" y="108" fill="#e9d5ff" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans, system-ui">3.24%</text>
          {/* Mini area chart */}
          <path d="M354 124 L362 120 L370 122 L378 116 L386 118 L394 112 L402 108 L410 110 L418 104 L426 106 L426 124 Z" fill="url(#sparkGrad)" opacity="0.4" />
          <polyline points="354,124 362,120 370,122 378,116 386,118 394,112 402,108 410,110 418,104 426,106" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
          <rect x="400" y="84" width="36" height="14" rx="7" fill="#22c55e" fillOpacity="0.15" />
          <text x="410" y="94" fill="#4ade80" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui">+2.1%</text>
        </g>

        {/* ── ROW 2: Main chart + Donut ── */}
        {/* Revenue chart card */}
        <rect x="110" y="146" width="220" height="130" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="122" y="158" width="50" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.2" />
        <rect x="122" y="166" width="30" height="4" rx="2" fill="#c4b5fd" fillOpacity="0.1" />

        {/* Grid lines */}
        {[200, 218, 236, 254].map((gy) => (
          <line key={gy} x1="122" y1={gy} x2="318" y2={gy} stroke="#c4b5fd" strokeOpacity="0.06" strokeWidth="0.5" />
        ))}

        {/* Grouped bar chart (pairs) */}
        {[
          { x: 130, h1: 36, h2: 24 },
          { x: 156, h1: 48, h2: 32 },
          { x: 182, h1: 28, h2: 42 },
          { x: 208, h1: 56, h2: 38 },
          { x: 234, h1: 44, h2: 52 },
          { x: 260, h1: 60, h2: 44 },
          { x: 286, h1: 50, h2: 36 },
        ].map((bar, i) => (
          <g key={bar.x}>
            <rect x={bar.x} y={264 - bar.h1} width="9" height={bar.h1} rx="2" fill="url(#barV)" fillOpacity="0.85">
              <animate attributeName="height" values={`${bar.h1 - 8};${bar.h1};${bar.h1 - 8}`} dur="4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="y" values={`${264 - bar.h1 + 8};${264 - bar.h1};${264 - bar.h1 + 8}`} dur="4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </rect>
            <rect x={bar.x + 11} y={264 - bar.h2} width="9" height={bar.h2} rx="2" fill="url(#barV2)" fillOpacity="0.7">
              <animate attributeName="height" values={`${bar.h2 - 6};${bar.h2};${bar.h2 - 6}`} dur="4s" begin={`${i * 0.2 + 0.1}s`} repeatCount="indefinite" />
              <animate attributeName="y" values={`${264 - bar.h2 + 6};${264 - bar.h2};${264 - bar.h2 + 6}`} dur="4s" begin={`${i * 0.2 + 0.1}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}

        {/* Donut chart card */}
        <rect x="338" y="146" width="112" height="130" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="350" y="158" width="40" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.2" />

        {/* Donut */}
        <circle cx="394" cy="220" r="30" fill="none" stroke="url(#donutG1)" strokeWidth="10" strokeDasharray="104 84" strokeLinecap="round" transform="rotate(-90 394 220)">
          <animate attributeName="stroke-dasharray" values="94 94;110 78;94 94" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="394" cy="220" r="30" fill="none" stroke="url(#donutG2)" strokeWidth="10" strokeDasharray="52 136" strokeDashoffset="-108" strokeLinecap="round" transform="rotate(-90 394 220)" opacity="0.6" />
        <circle cx="394" cy="220" r="30" fill="none" stroke="#c084fc" strokeWidth="10" strokeDasharray="22 166" strokeDashoffset="-164" strokeLinecap="round" transform="rotate(-90 394 220)" opacity="0.35" />
        {/* Center text */}
        <text x="394" y="217" textAnchor="middle" fill="#e9d5ff" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, system-ui">68%</text>
        <text x="394" y="229" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="Inter, system-ui" opacity="0.5">Growth</text>

        {/* Legend dots */}
        <circle cx="356" cy="258" r="3" fill="url(#donutG1)" />
        <rect x="364" y="256" width="24" height="4" rx="2" fill="#c4b5fd" fillOpacity="0.2" />
        <circle cx="356" cy="270" r="3" fill="url(#donutG2)" opacity="0.6" />
        <rect x="364" y="268" width="20" height="4" rx="2" fill="#c4b5fd" fillOpacity="0.15" />

        {/* ── ROW 3: Activity feed + trend line ── */}
        {/* Activity / table card */}
        <rect x="110" y="286" width="220" height="90" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="122" y="298" width="60" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.2" />

        {/* Table rows */}
        {[312, 332, 352].map((ry, ri) => (
          <g key={ry}>
            <circle cx="130" cy={ry + 4} r="6" fill="#7c3aed" fillOpacity={0.25 + ri * 0.1} />
            <rect x="142" y={ry} width={40 + ri * 5} height="4" rx="2" fill="#c4b5fd" fillOpacity="0.2" />
            <rect x="142" y={ry + 7} width={28 - ri * 3} height="3" rx="1.5" fill="#c4b5fd" fillOpacity="0.1" />
            <rect x={280 - ri * 10} y={ry + 1} width="32" height="10" rx="5" fill={ri === 0 ? "#22c55e" : ri === 1 ? "#818cf8" : "#f59e0b"} fillOpacity="0.15" />
            <rect x={285 - ri * 10} y={ry + 4} width="22" height="3" rx="1.5" fill={ri === 0 ? "#4ade80" : ri === 1 ? "#a78bfa" : "#fbbf24"} fillOpacity="0.5" />
          </g>
        ))}

        {/* Trend card (bottom-right) */}
        <rect x="338" y="286" width="112" height="90" rx="10" fill="url(#glassCard)" stroke="#a78bfa" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="350" y="298" width="44" height="5" rx="2.5" fill="#c4b5fd" fillOpacity="0.2" />

        {/* Area chart with animated line */}
        <path d="M350 360 L362 348 L374 352 L386 340 L398 344 L410 330 L422 334 L434 322 L438 326 L438 364 L350 364 Z" fill="url(#areaFill)" opacity="0.5" />
        <polyline points="350,360 362,348 374,352 386,340 398,344 410,330 422,334 434,322 438,326" stroke="url(#lineStroke)" strokeWidth="2" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </polyline>
        {/* Pulse dot at peak */}
        <circle cx="434" cy="322" r="3" fill="#c084fc">
          <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="fillOpacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>

        </g>

        {/* ══════════ FLOATING DECORATIVE ELEMENTS ══════════ */}

        {/* Notification toast (floating above, top-right) */}
        <g style={{ animation: "float 5s ease-in-out 0.5s infinite" }}>
          <rect x="360" y="2" width="110" height="36" rx="10" fill="#1a1625" stroke="#a78bfa" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="378" cy="20" r="6" fill="#22c55e" fillOpacity="0.7">
            <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M375 20 L377 22.5 L382 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          <rect x="390" y="14" width="52" height="4" rx="2" fill="#c4b5fd" fillOpacity="0.3" />
          <rect x="390" y="22" width="36" height="3" rx="1.5" fill="#c4b5fd" fillOpacity="0.15" />
        </g>

        {/* Floating cursor pointer (interacting with chart) */}
        <g style={{ animation: "float 4s ease-in-out 1.5s infinite" }}>
          <path d="M268 190 L268 206 L274 202 L280 210 L283 208 L277 200 L284 198 Z" fill="#e9d5ff" fillOpacity="0.6" />
        </g>

        {/* Sparkle particles scattered */}
        {[
          { cx: 8, cy: 60, r: 1.5, dur: "3s", delay: "0s" },
          { cx: 100, cy: 10, r: 1, dur: "2.5s", delay: "0.5s" },
          { cx: 472, cy: 140, r: 1.5, dur: "4s", delay: "1s" },
          { cx: 470, cy: 320, r: 1, dur: "3.5s", delay: "0.3s" },
          { cx: 6, cy: 280, r: 1.2, dur: "3s", delay: "1.5s" },
          { cx: 200, cy: 6, r: 1, dur: "2.8s", delay: "0.8s" },
          { cx: 6, cy: 180, r: 1.3, dur: "3.2s", delay: "0.2s" },
          { cx: 472, cy: 250, r: 1, dur: "2.6s", delay: "1.2s" },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#c4b5fd" fillOpacity="0.3">
            <animate attributeName="fillOpacity" values="0.1;0.5;0.1" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Cross/plus decorations */}
        <g opacity="0.15">
          <line x1="4" y1="100" x2="12" y2="100" stroke="#a78bfa" strokeWidth="1" />
          <line x1="8" y1="96" x2="8" y2="104" stroke="#a78bfa" strokeWidth="1" />
        </g>
        <g opacity="0.12">
          <line x1="468" y1="380" x2="476" y2="380" stroke="#818cf8" strokeWidth="1" />
          <line x1="472" y1="376" x2="472" y2="384" stroke="#818cf8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="flex min-h-svh">
      {/* Left — branding panel with animated dashboard illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-between bg-[#0c0a1a] p-2xl relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-primary/[0.08] blur-[100px]" />
          <div className="absolute bottom-[15%] left-[20%] w-[350px] h-[250px] rounded-full bg-indigo-500/[0.06] blur-[80px]" />
          <div className="absolute top-[60%] right-[10%] w-[200px] h-[200px] rounded-full bg-purple-500/[0.04] blur-[60px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#c4b5fd 1px, transparent 1px), linear-gradient(90deg, #c4b5fd 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-sm">
          <ShopPulseLogo size={28} />
          <span className="text-white/90 font-heading text-lg font-bold tracking-tight">ShopPulse</span>
        </div>

        {/* Center — illustration + tagline */}
        <div className="relative z-10 flex flex-col items-center gap-lg">
          <AuthIllustration />
          <div className="text-center max-w-[360px]">
            <h2 className="text-[24px] font-heading font-bold text-white/90 leading-tight tracking-tight mb-xs">
              Powerful analytics for<br />modern e-commerce
            </h2>
            <p className="sp-body text-white/35 leading-relaxed">
              Real-time revenue tracking, order insights, and growth metrics — everything you need in one beautiful dashboard.
            </p>
          </div>
        </div>

        {/* Bottom: stats + copyright */}
        <div className="relative z-10 flex flex-col items-center gap-md w-full">
          <div className="flex items-center gap-xl">
            <div className="text-center">
              <p className="text-white/80 font-heading text-lg font-bold">10K+</p>
              <p className="sp-caption text-white/25">Active Users</p>
            </div>
            <div className="w-px h-lg bg-white/[0.08]" />
            <div className="text-center">
              <p className="text-white/80 font-heading text-lg font-bold">99.9%</p>
              <p className="sp-caption text-white/25">Uptime</p>
            </div>
            <div className="w-px h-lg bg-white/[0.08]" />
            <div className="text-center">
              <p className="text-white/80 font-heading text-lg font-bold">4.9★</p>
              <p className="sp-caption text-white/25">Rating</p>
            </div>
          </div>
          <p className="sp-caption text-white/15">&copy; 2026 ShopPulse. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex flex-1 items-center justify-center bg-background p-lg sm:p-xl relative overflow-hidden">
        {/* Subtle violet ambient glow — connects visually to left panel */}
        <div className="absolute top-0 left-0 w-[400px] h-[300px] rounded-full bg-primary/[0.03] blur-[100px] dark:bg-primary/[0.04]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[250px] rounded-full bg-indigo-500/[0.02] blur-[80px] dark:bg-indigo-500/[0.03]" />
        <PageTransition className="w-full flex items-center justify-center">
          <Outlet />
        </PageTransition>
      </div>
    </div>
  )
}
