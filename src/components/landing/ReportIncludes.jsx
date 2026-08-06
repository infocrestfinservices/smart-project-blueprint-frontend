import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { REPORT_INCLUDES } from "./landingData";

export default function ReportIncludes() {
  return (
    <section id="includes" className="relative bg-muted/30 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            Inside every report
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Everything your lender or investor asks for
          </h2>
          <p className="text-muted-foreground mt-3">
            A complete, submission-ready document — not a blank template you still have to fill in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REPORT_INCLUDES.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-card"
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-accent text-accent-foreground grid place-items-center">
                <item.icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            See everything ReportCraft produces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
