import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Star, TrendingUp, IndianRupee, ShieldCheck,
  FileText, Sparkles, Check, Layers, Globe2, Download, BarChart3, PlayCircle,
} from "lucide-react";

const BARS = [42, 58, 50, 72, 66, 85, 78, 94];
const AVATARS = ["RM", "PN", "AK", "SV"];

// Concrete app capabilities — what ReportCraft actually produces.
const CAPABILITIES = [
  { icon: Layers, label: "9 industry templates", sub: "Agri · Tech · Mfg · more" },
  { icon: Globe2, label: "CMA · SBA · Mudra · PMEGP", sub: "Bank & scheme formats" },
  { icon: BarChart3, label: "DSCR · IRR · MOIC", sub: "Lender-grade metrics" },
  { icon: Download, label: "PDF · Word · Excel", sub: "Submission-ready export" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 via-background to-background" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-grid mask-fade opacity-60" />
      <div className="absolute top-[-12%] left-1/2 -translate-x-1/2 -z-10 w-[820px] h-[440px] bg-primary/15 blur-[130px] rounded-full" />
      <div className="absolute top-[8%] right-[6%] -z-10 w-[360px] h-[360px] bg-emerald-400/10 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2.5 bg-card/80 backdrop-blur border border-border shadow-sm text-xs font-medium pl-1.5 pr-3.5 py-1.5 rounded-full mb-7 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary font-semibold px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5" /> Claude Opus AI
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-foreground">10,000+</span> reports generated
          </span>
        </div>

        <h1 className="text-[2.5rem] sm:text-6xl font-heading font-bold tracking-tight leading-[1.05] animate-fade-up animation-delay-100">
          Bank &amp; investor-ready
          <br className="hidden sm:block" />{" "}
          <span className="text-gradient">project reports in minutes</span>
        </h1>

        <p className="text-muted-foreground mt-7 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed animate-fade-up animation-delay-200">
          Describe your business idea. ReportCraft <span className="text-foreground font-medium">interviews you</span>,
          builds a 5-year financial model, and writes a complete <span className="text-foreground font-medium">CMA, SBA or
          investor-grade report</span> — formatted exactly how your bank, scheme, or investor expects.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9 animate-fade-up animation-delay-300">
          <Link to="/create">
            <Button size="lg" className="h-12 px-7 text-base gap-2 shadow-xl shadow-primary/30 w-full sm:w-auto group">
              Create your free report
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" size="lg" className="h-12 px-7 text-base gap-2 w-full sm:w-auto bg-card group">
              <PlayCircle className="w-5 h-5 text-primary" />
              See how it works
            </Button>
          </Link>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 mt-9 animate-fade-up animation-delay-500">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {AVATARS.map((a, i) => (
                <span
                  key={a}
                  className={`w-8 h-8 rounded-full border-2 border-background grid place-items-center text-[10px] font-bold text-white bg-gradient-to-br ${
                    ["from-blue-600 to-indigo-600", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-sky-500 to-blue-500"][i]
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-sm font-semibold text-foreground">4.9</span>
              </div>
              <p className="text-xs text-muted-foreground">from 2,100+ founders</p>
            </div>
          </div>

          <span className="hidden sm:block w-px h-8 bg-border" />

          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-emerald-500" /> No credit card needed
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Bank-grade formatting
          </span>
        </div>

        {/* Capability strip — concrete app detail */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-12 animate-fade-up animation-delay-500">
          {CAPABILITIES.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/70 backdrop-blur px-4 py-3 text-left shadow-sm"
            >
              <span className="shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-accent text-accent-foreground">
                <c.icon className="w-4 h-4" />
              </span>
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold truncate">{c.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                    <IndianRupee className="w-5 h-5" />2.4 Cr
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> +38%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { k: "DSCR", v: "1.82" },
                  { k: "IRR", v: "24.6%" },
                  { k: "Payback", v: "3.1 yr" },
                  { k: "MOIC", v: "3.4x" },
                ].map((m) => (
                  <div key={m.k} className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground">{m.k}</p>
                    <p className="text-base font-bold">{m.v}</p>
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
                <p className="text-sm font-semibold">Revenue &amp; Profit Projection</p>
                <span className="text-xs text-muted-foreground">FY1 – FY8</span>
              </div>
              <div className="h-44 flex items-end gap-2.5">
                {BARS.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1">
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
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Revenue</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Net Profit</span>
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
