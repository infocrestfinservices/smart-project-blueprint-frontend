import React from "react";
import { Layers, Globe2, Download, BarChart3 } from "lucide-react";
import FinanceBackdrop from "./FinanceBackdrop";
import IndustriesShowcase from "./IndustriesShowcase";

// Concrete app capabilities — what ReportCraft actually produces.
const CAPABILITIES = [
  { icon: Layers, label: "9 industry templates", sub: "Agri · Tech · Mfg · more" },
  { icon: Globe2, label: "CMA · SBA · Mudra · PMEGP", sub: "Bank & scheme formats" },
  { icon: BarChart3, label: "DSCR · IRR · MOIC", sub: "Lender-grade metrics" },
  { icon: Download, label: "PDF · Word · Excel", sub: "Submission-ready export" },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Backdrop */}
      <FinanceBackdrop />
      <div className="absolute top-[-12%] left-1/2 -translate-x-1/2 -z-10 w-[820px] h-[440px] bg-primary/10 blur-[130px] rounded-full" />
      <div className="absolute top-[8%] right-[6%] -z-10 w-[360px] h-[360px] bg-emerald-400/10 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1] text-primary animate-fade-up">
          Bank <span className="font-body font-normal">&amp;</span> Investor-Ready
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
    </section>
  );
}
