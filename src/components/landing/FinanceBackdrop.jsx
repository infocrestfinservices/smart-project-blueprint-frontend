import React from "react";
import heroBg from "@/assets/hero-fintech-bg.webp";

// The client's own reference image, used as-is — a hand-drawn SVG recreation
// could only ever approximate it, never match it exactly. Height is capped
// near the image's own aspect ratio (not stretched to the full, much taller
// hero section) and fades to the page background at its own bottom edge, so
// there's no hard cutoff line where the hero's later content begins.
export default function FinanceBackdrop() {
  return (
    <div className="absolute inset-x-0 top-0 -z-10 h-[820px] sm:h-[920px] lg:h-[1000px] overflow-hidden pointer-events-none select-none">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* Fade the art out behind the centered headline so text stays crisp */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/70 to-transparent" />
      {/* Fade to the page background at the bottom instead of a hard edge */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
