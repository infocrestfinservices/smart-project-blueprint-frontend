import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, ONE_TIME } from "./landingData";

export default function Pricing({ showHeader = true }) {
  return (
    <section id="pricing" className="bg-muted/30 border-y">
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16 ${showHeader ? "pt-14 sm:pt-16" : "pt-8 sm:pt-10"}`}>
        {showHeader && (
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Pricing</p>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold">Plans for every need</h3>
            <p className="text-muted-foreground mt-3">Start free. Upgrade when you need more. Cancel anytime.</p>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start md:pt-4">
          {PLANS.map((plan) => {
            const popular = Boolean(plan.tag);
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-card flex flex-col transition-all ${
                  popular
                    ? "border-primary shadow-2xl shadow-primary/20 md:-mt-4 md:mb-4 ring-1 ring-primary/20"
                    : "border-border shadow-sm hover:shadow-md"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {plan.tag}
                  </div>
                )}

                {/* Header */}
                <div className="px-6 pt-7 pb-6 border-b">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-4xl font-heading font-bold ${popular ? "text-primary" : ""}`}>{plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed min-h-[2.5rem]">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 flex-1 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      }
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60 line-through"}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 mt-auto">
                  <Link to="/create">
                    <Button variant={plan.variant} className="w-full gap-1.5" size="lg">
                      {plan.cta}
                      {popular && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          🔒 Secure payments · 7-day money-back guarantee · GST invoice on every plan
        </p>

        {/* One-time purchases */}
        <div className="mt-16 pt-12 border-t">
          <div className="text-center mb-8">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Pay as you go</p>
            <h4 className="text-2xl sm:text-3xl font-heading font-bold">Or just pay per report</h4>
            <p className="text-muted-foreground text-sm mt-2">No subscription needed — buy exactly what you need, when you need it.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ONE_TIME.map((item) => (
              <div key={item.name} className="bg-card border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xl font-heading font-bold text-primary">{item.price}</span>
                </div>
                <p className="font-semibold text-sm mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                <Link to="/create">
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-xs gap-1 group-hover:bg-primary/5">
                    Generate Now <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
