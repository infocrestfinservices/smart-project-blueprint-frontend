import React from "react";
import {
  LandingNavbar,
  Hero,
  Stats,
  Features,
  HowItWorks,
  ReportIncludes,
  CTABanner,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme / hero */}
      <LandingNavbar />
      <Hero />

      {/* Information sections — what ReportCraft offers, in order.
          LogoMarquee, Industries and Testimonials were dropped: the hero's
          own industries strip and capability banner already cover that
          ground, so those sections were pure repetition. HowItWorks is
          back, redesigned around the live chat demo. */}
      <Features />         {/* Why ReportCraft — core capabilities */}
      <HowItWorks />       {/* How it works — 3 steps beside the live demo */}
      <ReportIncludes />   {/* What's inside every report — deliverables */}

      {/* Proof & conversion */}
      <Stats />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
