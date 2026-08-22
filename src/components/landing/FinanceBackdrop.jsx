import React from "react";
import { Landmark, CreditCard, PieChart, TrendingUp, IndianRupee, ShieldCheck } from "lucide-react";

// Decorative fintech backdrop for the hero — dotted globe, hex-badge icons,
// an ascending candlestick chart and flowing wave lines, in the brand's
// navy/emerald palette. Kept out of the centered text column (roughly the
// middle third) so it frames the headline instead of fighting it.
const BADGES = [
  { Icon: Landmark, top: "58%", left: "4%" },
  { Icon: CreditCard, top: "70%", left: "12%" },
  { Icon: PieChart, top: "82%", left: "6%" },
  { Icon: TrendingUp, top: "10%", left: "90%" },
  { Icon: IndianRupee, top: "22%", left: "96%" },
  { Icon: ShieldCheck, top: "34%", left: "91%" },
];

const CANDLES = [26, 36, 30, 46, 40, 58, 52, 72, 64, 86, 78, 98];

export default function FinanceBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.10] via-accent/50 to-background" />
      <div className="absolute top-[-10%] left-[8%] w-[420px] h-[420px] bg-primary/15 blur-[110px] rounded-full" />
      <div className="absolute top-[6%] right-[4%] w-[380px] h-[380px] bg-emerald-400/20 blur-[110px] rounded-full" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1536 1100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id="fb-dots" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.6" fill="hsl(var(--primary))" fillOpacity="0.6" />
          </pattern>
          <clipPath id="fb-globe-clip">
            <circle cx="200" cy="620" r="210" />
          </clipPath>
        </defs>

        {/* Globe, bottom-left */}
        <g>
          <circle cx="200" cy="620" r="210" fill="url(#fb-dots)" clipPath="url(#fb-globe-clip)" />
          <circle cx="200" cy="620" r="210" stroke="hsl(var(--primary))" strokeOpacity="0.35" strokeWidth="1.5" />
          <ellipse cx="200" cy="620" rx="210" ry="74" stroke="hsl(var(--primary))" strokeOpacity="0.3" />
          <ellipse cx="200" cy="620" rx="95" ry="210" stroke="hsl(var(--primary))" strokeOpacity="0.3" />
          <path d="M20 470 Q200 400 380 470" stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeDasharray="2 7" strokeLinecap="round" />
          <path d="M60 780 L120 745 L190 762 L270 705 L340 660" stroke="hsl(var(--chart-2))" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="340" cy="660" r="5" fill="hsl(var(--chart-2))" />
          <path d="M40 430 L95 375 M85 375 L95 375 L95 385" stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* Ascending bar chart, under the globe */}
        <g>
          {[46, 78, 62, 106, 92, 134, 118, 168].map((h, i) => (
            <rect
              key={i}
              x={430 + i * 34}
              y={960 - h}
              width="20"
              height={h}
              rx="3"
              fill="hsl(var(--primary))"
              fillOpacity={0.16 + i * 0.045}
            />
          ))}
        </g>

        {/* Hexagon outlines behind the icon badges */}
        {[
          [62, 638], [184, 770], [92, 902],
          [1382, 110], [1474, 242], [1398, 374],
        ].map(([cx, cy], i) => (
          <polygon
            key={i}
            points={hexPoints(cx, cy, 48)}
            fill="hsl(var(--card))"
            fillOpacity="0.85"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        ))}

        {/* Ascending candlesticks, right side */}
        <g>
          {CANDLES.map((h, i) => {
            const x = 1130 + i * 27;
            const y = 900 - h;
            return (
              <g key={i}>
                <line x1={x + 6} y1={y - 12} x2={x + 6} y2={y + h + 12} stroke="hsl(var(--chart-2))" strokeOpacity="0.85" strokeWidth="1.5" />
                <rect x={x} y={y} width="13" height={h} rx="2"
                      fill={i % 2 === 0 ? "hsl(var(--card))" : "hsl(var(--chart-2))"}
                      fillOpacity={i % 2 === 0 ? 0.9 : 0.85}
                      stroke="hsl(var(--chart-2))" strokeOpacity="0.85" strokeWidth="1.5" />
              </g>
            );
          })}
        </g>

        {/* Dot-grid patch, top-right */}
        <rect x="1290" y="10" width="220" height="160" fill="url(#fb-dots)" />

        {/* Flowing wave lines along the bottom */}
        <g strokeLinecap="round" fill="none">
          <path d="M0 1000 C 220 950 380 1050 620 1010 S 1060 950 1300 1000 S 1536 970 1536 970"
                stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeWidth="2.5" />
          <path d="M0 1035 C 260 1070 460 990 720 1030 S 1140 1070 1536 1020"
                stroke="hsl(var(--chart-2))" strokeOpacity="0.35" strokeWidth="2.5" />
          <path d="M0 970 C 300 930 520 1000 800 965 S 1220 930 1536 960"
                stroke="hsl(var(--primary))" strokeOpacity="0.25" strokeWidth="2" />
        </g>
      </svg>

      {/* Icon badges — real lucide icons, laid over the hexagon outlines above */}
      {BADGES.map(({ Icon, top, left }, i) => (
        <div
          key={i}
          className="absolute grid place-items-center w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary/25 bg-card/90 backdrop-blur-sm shadow-md text-primary"
          style={{ top, left }}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      ))}

      {/* Fade the art out behind the centered headline so text stays crisp */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/80 to-transparent" />
    </div>
  );
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}
