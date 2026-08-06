import React from "react";
import { STATS } from "./landingData";

export default function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="relative rounded-3xl bg-brand-gradient overflow-hidden shadow-xl shadow-primary/20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/15">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4 py-8 sm:py-10">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/75 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
