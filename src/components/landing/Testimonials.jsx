import React from "react";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "./landingData";

const AVATAR_TINTS = [
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

export default function Testimonials() {
  return (
    <section id="reviews" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
          Trusted by Entrepreneurs
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
          Loved by founders, CAs &amp; consultants
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className="relative bg-card border rounded-3xl p-7 flex flex-col gap-5 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-[15px] text-foreground/80 leading-relaxed flex-1">
              "{t.text}"
            </blockquote>
            <figcaption className="flex items-center gap-3 pt-1 border-t">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_TINTS[i % 3]} text-white text-xs font-bold grid place-items-center mt-3`}>
                {t.avatar}
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
