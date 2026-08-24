import React, { useEffect, useRef, useState } from "react";
import {
  TrendingUp, IndianRupee, ShieldCheck,
  FileText, Check, Layers, Globe2, Download, BarChart3,
} from "lucide-react";
import FinanceBackdrop from "./FinanceBackdrop";
import IndustriesShowcase from "./IndustriesShowcase";

const BARS = [42, 58, 50, 72, 66, 85, 78, 94];

// Concrete app capabilities — what ReportCraft actually produces.
const CAPABILITIES = [
  { icon: Layers, label: "9 industry templates", sub: "Agri · Tech · Mfg · more" },
  { icon: Globe2, label: "CMA · SBA · Mudra · PMEGP", sub: "Bank & scheme formats" },
  { icon: BarChart3, label: "DSCR · IRR · MOIC", sub: "Lender-grade metrics" },
  { icon: Download, label: "PDF · Word · Excel", sub: "Submission-ready export" },
];

// Counts up from 0 to `to` once, on mount — the KPI tiles in the report
// preview should read as live-computed figures, not a static screenshot.
function AnimatedNumber({ to, decimals = 0, duration = 1200, delay = 0, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let raf;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(to * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [to, duration, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Backdrop */}
      <FinanceBackdrop />
      <div className="absolute top-[-12%] left-1/2 -translate-x-1/2 -z-10 w-[820px] h-[440px] bg-primary/10 blur-[130px] rounded-full" />
      <div className="absolute top-[8%] right-[6%] -z-10 w-[360px] h-[360px] bg-emerald-400/10 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 text-center">
        <h1 className="text-[2.5rem] sm:text-6xl font-heading font-bold tracking-tight leading-[1.05] animate-fade-up">
          Bank <span className="font-body font-normal text-primary">&amp;</span> investor-ready
          <br className="hidden sm:block" />{" "}
          <span className="text-gradient">project reports in minutes</span>
        </h1>

        {/* Capability strip — one unified banner, icon-over-stat style */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mt-10 shadow-xl shadow-primary/20 animate-fade-up animation-delay-200">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-hover to-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_100%,rgba(16,185,129,0.35),transparent_55%)]" />
          <div className="relative grid grid-cols-2 sm:grid-cols-4 divide-y divide-x sm:divide-y-0 divide-white/15">
            {CAPABILITIES.map((c) => (
              <div key={c.label} className="flex flex-col items-center text-center px-4 py-7 sm:py-9">
                <c.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white mb-3" strokeWidth={1.5} />
                <p className="text-white font-bold text-base sm:text-lg leading-snug">{c.label}</p>
                <p className="text-white/70 text-xs sm:text-sm mt-1">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IndustriesShowcase />

      {/* Product preview — the "hero screenshot" */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-14 pb-20 sm:pb-24 animate-fade-up animation-delay-700">
        <div className="absolute inset-x-8 -top-4 h-40 bg-brand-gradient blur-3xl opacity-20 -z-10" />

        <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden ring-1 ring-black/5">
          {/* App top bar */}
          <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-muted/40">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border rounded-md px-3 py-1">
              <FileText className="w-3.5 h-3.5" /> Feasibility Study — Cloud Kitchen, Pune
            </div>
          </div>

          {/* Report body */}
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-0">
            {/* Left: metrics */}
            <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Projected Revenue · Yr 5</p>
                  <p className="text-2xl font-heading font-bold flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    <AnimatedNumber to={2.4} decimals={1} delay={500} suffix=" Cr" />
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> +<AnimatedNumber to={38} delay={700} suffix="%" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { k: "DSCR", to: 1.82, decimals: 2, suffix: "" },
                  { k: "IRR", to: 24.6, decimals: 1, suffix: "%" },
                  { k: "Payback", to: 3.1, decimals: 1, suffix: " yr" },
                  { k: "MOIC", to: 3.4, decimals: 1, suffix: "x" },
                ].map((m, i) => (
                  <div key={m.k} className="relative overflow-hidden rounded-xl border border-primary/20 bg-muted/30 px-3 py-2.5">
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-primary/50" />
                    <p className="text-[11px] text-muted-foreground">{m.k}</p>
                    <p className="text-base font-bold">
                      <AnimatedNumber to={m.to} decimals={m.decimals} suffix={m.suffix} delay={600 + i * 120} />
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                {["CMA format · SBI", "Bank-ready PDF export", "5-year P&L projection"].map((t) => (
                  <p key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> {t}
                  </p>
                ))}
              </div>
            </div>

            {/* Right: chart */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                  </span>
                  Revenue &amp; Profit Projection
                </p>
                <span className="text-xs text-muted-foreground">FY1 – FY8</span>
              </div>
              <div className="relative h-44">
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={BARS.map((h, i) => `${(i / (BARS.length - 1)) * 100},${100 - h}`).join(" ")}
                    fill="none"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="animate-draw-line"
                    pathLength="100"
                  />
                </svg>
                <div className="relative h-full flex items-end gap-2.5">
                  {BARS.map((h, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1">
                      <div
                        className="rounded-t-md bg-gradient-to-t from-primary/40 to-primary origin-bottom animate-grow-bar"
                        style={{ height: `${h}%`, animationDelay: `${0.4 + i * 0.07}s` }}
                      />
                      <div
                        className="rounded-t-sm bg-emerald-400/70 origin-bottom animate-grow-bar"
                        style={{ height: `${h * 0.42}%`, animationDelay: `${0.5 + i * 0.07}s` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Revenue</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Net Profit</span>
                <span className="inline-flex items-center gap-1.5 ml-auto"><span className="w-2.5 h-0.5 rounded-full bg-chart-2" /> Trend</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating accent */}
        <div className="absolute -bottom-4 right-6 sm:right-10 bg-card border border-border rounded-xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white grid place-items-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Loan Approved</p>
            <p className="text-[11px] text-muted-foreground">Generated in 4 min</p>
          </div>
        </div>
      </div>
    </section>
  );
}
