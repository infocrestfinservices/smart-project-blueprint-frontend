import React from "react";
import heroBg from "@/assets/hero-fintech-bg.webp";

// The client's own reference image, used as-is — a hand-drawn SVG recreation
// could only ever approximate it, never match it exactly.
export default function FinanceBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Fade the art out behind the centered headline so text stays crisp */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/70 to-transparent" />
    </div>
  );
}
