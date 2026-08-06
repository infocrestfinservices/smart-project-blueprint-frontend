import React from "react";
import {
  LandingNavbar,
  Hero,
  LogoMarquee,
  Stats,
  Features,
  HowItWorks,
  Industries,
  ReportIncludes,
  Testimonials,
  CTABanner,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme / hero */}
      <LandingNavbar />
      <Hero />

      {/* Information sections — what ReportCraft offers, in order */}
      <LogoMarquee />      {/* Formats banks & schemes expect */}
      <Features />         {/* Why ReportCraft — core capabilities */}
      <HowItWorks />       {/* How it works — 3 steps */}
      <Industries />       {/* Which industries we cover — 9 sectors */}
      <ReportIncludes />   {/* What's inside every report — deliverables */}

      {/* Proof & conversion */}
      <Stats />
      <Testimonials />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
