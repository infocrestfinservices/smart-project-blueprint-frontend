import React from "react";
import { Landmark, CreditCard, PieChart, TrendingUp, DollarSign, ShieldCheck } from "lucide-react";

// Decorative fintech backdrop for the hero — dotted globe, transparent hex
// icon badges, a blurred city skyline, an ascending candlestick chart and
// flowing wave ribbons, all in the brand's navy/emerald palette. Modelled
// closely on a reference stock-photo composition the client supplied.
const VB_W = 1536;
const VB_H = 1024;

// Percent positions match the SVG hexagon centres below, so the real lucide
// icon sits exactly inside its outline.
const BADGES = [
  { Icon: Landmark, cx: 118, cy: 695 },
  { Icon: CreditCard, cx: 232, cy: 752 },
  { Icon: PieChart, cx: 172, cy: 826 },
  { Icon: TrendingUp, cx: 1308, cy: 238 },
  { Icon: DollarSign, cx: 1458, cy: 308 },
  { Icon: ShieldCheck, cx: 1344, cy: 420 },
];

const CANDLES = [30, 42, 34, 52, 46, 66, 58, 80, 72, 96, 86, 108, 100, 122];
const BARS = [40, 70, 55, 100, 84, 130, 112, 158, 140, 182];
const SKYLINE = [40, 90, 60, 120, 75, 150, 95, 130, 70, 160, 110, 85, 140, 65, 100, 45];

export default function FinanceBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Base wash — brightest at the top-centre, cooling toward the corners */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-background to-accent/40" />
      <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-white/40 blur-[140px] rounded-full" />
      <div className="absolute top-[10%] left-[4%] w-[420px] h-[420px] bg-primary/15 blur-[120px] rounded-full" />
      <div className="absolute top-[4%] right-[2%] w-[380px] h-[380px] bg-emerald-400/15 blur-[120px] rounded-full" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id="fb-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
          </pattern>
          <clipPath id="fb-globe-clip">
            <circle cx="195" cy="355" r="220" />
          </clipPath>
          <filter id="fb-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <linearGradient id="fb-wave-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="fb-wave-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Blurred city skyline, spanning the mid-ground */}
        <g filter="url(#fb-blur)" opacity="0.5">
          {SKYLINE.map((h, i) => (
            <rect key={i} x={560 + i * 38} y={800 - h * 3.1} width="30" height={h * 3.1}
                  fill="hsl(var(--primary))" fillOpacity="0.22" />
          ))}
        </g>

        {/* Circuit trace, top-left corner */}
        <path d="M0 0 L0 40 L60 40 L60 90 L150 90 L150 60 L230 60"
              stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
        <circle cx="230" cy="60" r="4" fill="hsl(var(--primary))" fillOpacity="0.4" />
        <path d="M270 130 L305 90 M298 90 L305 90 L305 97"
              stroke="hsl(var(--primary))" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Globe, left-centre */}
        <g>
          <circle cx="195" cy="355" r="220" fill="url(#fb-dots)" clipPath="url(#fb-globe-clip)" />
          <circle cx="195" cy="355" r="220" stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.5" />
          <ellipse cx="195" cy="355" rx="220" ry="78" stroke="hsl(var(--primary))" strokeOpacity="0.22" />
          <ellipse cx="195" cy="355" rx="98" ry="220" stroke="hsl(var(--primary))" strokeOpacity="0.22" />
          <path d="M330 190 L380 250 L420 230" stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.25" fill="none" />
          <circle cx="420" cy="230" r="3.5" fill="hsl(var(--primary))" fillOpacity="0.5" />
          <path d="M370 470 L400 560 L360 610" stroke="hsl(var(--primary))" strokeOpacity="0.25" strokeWidth="1.25" fill="none" />
          <circle cx="360" cy="610" r="3.5" fill="hsl(var(--primary))" fillOpacity="0.45" />
        </g>

        {/* Ascending bar chart with a dotted trend line, bottom-left */}
        <g>
          {BARS.map((h, i) => (
            <rect key={i} x={250 + i * 33} y={912 - h} width="20" height={h} rx="2"
                  fill="hsl(var(--primary))" fillOpacity={0.14 + i * 0.02} />
          ))}
          <polyline
            points={BARS.map((h, i) => `${260 + i * 33},${912 - h - 14}`).join(" ")}
            fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          {BARS.map((h, i) => (
            <circle key={i} cx={260 + i * 33} cy={912 - h - 14} r="3.5" fill="hsl(var(--primary))" fillOpacity="0.6" />
          ))}
        </g>

        {/* Transparent hexagon outlines — the icons render as HTML on top */}
        {BADGES.map(({ cx, cy }, i) => (
          <polygon
            key={i}
            points={hexPoints(cx, cy, 50)}
            fill="hsl(var(--card))"
            fillOpacity="0.12"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        ))}

        {/* Circuit trace, top-right corner, linking the hexagon cluster to the edge */}
        <path d="M1536 20 L1470 20 L1470 70 L1420 70"
              stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
        <circle cx="1420" cy="70" r="4" fill="hsl(var(--primary))" fillOpacity="0.4" />

        {/* Ascending candlesticks with a trend line, right side */}
        <g>
          <path
            d={`M1190 ${900 - CANDLES[0]} ${CANDLES.map((h, i) => `L${1190 + i * 25} ${900 - h}`).join(" ")}`}
            stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.5" fill="none"
          />
          {CANDLES.map((h, i) => {
            const x = 1190 + i * 25;
            const y = 900 - h;
            return (
              <g key={i}>
                <line x1={x + 5.5} y1={y - 10} x2={x + 5.5} y2={y + h + 10} stroke="hsl(var(--primary))" strokeOpacity="0.55" strokeWidth="1.25" />
                <rect x={x} y={y} width="11" height={h} rx="2"
                      fill={i % 2 === 0 ? "hsl(var(--card))" : "hsl(var(--primary))"}
                      fillOpacity={i % 2 === 0 ? 0.75 : 0.5}
                      stroke="hsl(var(--primary))" strokeOpacity="0.55" strokeWidth="1.25" />
              </g>
            );
          })}
        </g>

        {/* Dot-grid patches */}
        <rect x="1300" y="0" width="220" height="150" fill="url(#fb-dots)" />
        <rect x="1360" y="850" width="160" height="140" fill="url(#fb-dots)" opacity="0.7" />

        {/* Radar / target rings, bottom-right */}
        <g stroke="hsl(var(--primary))" strokeOpacity="0.25" fill="none">
          <circle cx="1460" cy="960" r="14" />
          <circle cx="1460" cy="960" r="26" />
          <circle cx="1460" cy="960" r="38" />
        </g>

        {/* Flowing wave ribbons along the bottom — filled, layered */}
        <path d="M0 900 C 220 850 380 950 620 910 S 1060 850 1300 900 L1536 890 L1536 1024 L0 1024 Z"
              fill="url(#fb-wave-1)" />
        <path d="M0 960 C 300 920 520 990 800 955 S 1220 920 1536 950 L1536 1024 L0 1024 Z"
              fill="url(#fb-wave-2)" />
        <g strokeLinecap="round" fill="none">
          <path d="M0 900 C 220 850 380 950 620 910 S 1060 850 1300 900 S 1536 870 1536 870"
                stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M0 960 C 300 920 520 990 800 955 S 1220 920 1536 950"
                stroke="hsl(var(--primary))" strokeOpacity="0.22" strokeWidth="2" />
          <path d="M0 1000 C 260 1035 460 985 720 1010 S 1140 1040 1536 1000"
                stroke="hsl(var(--primary))" strokeOpacity="0.2" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Icon badges — real lucide icons, centred inside the SVG hexagon outlines */}
      {BADGES.map(({ Icon, cx, cy }, i) => (
        <div
          key={i}
          className="absolute grid place-items-center w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-primary/70"
          style={{ top: `${(cy / VB_H) * 100}%`, left: `${(cx / VB_W) * 100}%` }}
        >
          <Icon className="w-full h-full" strokeWidth={1.6} />
        </div>
      ))}

      {/* Fade the art out behind the centered headline so text stays crisp */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/75 to-transparent" />
    </div>
  );
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}
