import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { STEPS } from "./landingData";

export default function HowItWorks() {
  return (
    <section id="how" className="relative bg-muted/30 border-y overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade opacity-60" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            From idea to funded in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />

          {STEPS.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="relative mx-auto mb-6 w-14 h-14">
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-lg shadow-primary/30">
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border text-xs font-bold grid place-items-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            See the full process <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
