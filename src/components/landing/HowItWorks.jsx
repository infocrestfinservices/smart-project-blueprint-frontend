import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { STEPS } from "./landingData";

// Re-reveals each step as it scrolls in/out of view (not a one-shot fade),
// so the step list stays lively next to the always-looping demo clip.
function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function StepItem({ s }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`flex gap-5 transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="relative shrink-0 w-14 h-14">
        <div className="w-14 h-14 rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-lg shadow-primary/30">
          <s.icon className="w-6 h-6" />
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border text-xs font-bold grid place-items-center">
          {s.step}
        </span>
      </div>
      <div className="pt-1">
        <h3 className="font-semibold text-lg mb-1.5">{s.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{s.desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="relative bg-muted/30 border-y overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade opacity-60" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            From idea to funded in 3 steps
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Live demo — sticky beside the steps on desktop */}
          <div className="lg:sticky lg:top-28">
            <div className="-mx-4 sm:mx-auto sm:max-w-[374px]">
              <div className="relative h-[765px] overflow-hidden">
                <iframe
                  src="/chatbot-demo.html"
                  title="ReportCraft chat demo"
                  className="absolute top-0 left-0 w-[440px] h-[900px] border-0 origin-top-left scale-[0.85]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-12 sm:gap-16 lg:py-8">
            {STEPS.map((s) => (
              <StepItem key={s.step} s={s} />
            ))}
          </div>
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
