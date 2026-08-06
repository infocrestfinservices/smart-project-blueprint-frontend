import React from "react";
import { FORMATS } from "./landingData";

export default function LogoMarquee() {
  const items = [...FORMATS, ...FORMATS];
  return (
    <section className="border-y bg-card/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          Every format banks, schemes &amp; investors expect
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="flex w-max gap-3 animate-marquee pause-on-hover">
            {items.map((f, i) => (
              <span
                key={i}
                className="shrink-0 rounded-full border bg-background/60 px-4 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
