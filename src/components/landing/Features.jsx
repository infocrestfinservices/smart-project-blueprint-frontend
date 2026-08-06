import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FEATURES } from "./landingData";

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div className="max-w-xl">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            Why ReportCraft AI
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Everything a banker or investor needs
          </h2>
          <p className="text-muted-foreground mt-3">
            From CMA data to VC pitch decks — the right format, every time, for every region.
          </p>
        </div>
        <Link
          to="/features"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all shrink-0"
        >
          Explore all features <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="group bg-card p-6 sm:p-7 transition-colors hover:bg-muted/30"
          >
            <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
