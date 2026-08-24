import React from "react";
import { FileText } from "lucide-react";
import skilledapp from "@/assets/reports/skilledapp.webp";
import hardcider from "@/assets/reports/hardcider.webp";
import majorcityVilla from "@/assets/reports/majorcity-villa.webp";

const SCREENSHOTS = [skilledapp, hardcider, majorcityVilla];

// A tall browser-chrome frame with real report screenshots scrolling
// continuously through it, looped seamlessly (the list is doubled).
export default function ReportShowcase() {
  const looped = [...SCREENSHOTS, ...SCREENSHOTS];

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute inset-x-6 -top-4 h-32 bg-brand-gradient blur-3xl opacity-20 -z-10" />

      <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden ring-1 ring-black/5">
        <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-muted/40">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border rounded-md px-3 py-1">
            <FileText className="w-3.5 h-3.5" /> Real reports, real numbers
          </div>
        </div>

        <div className="relative h-[520px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_8%,#000_92%,transparent)]">
          <div className="flex flex-col gap-4 p-4 animate-marquee-vertical pause-on-hover">
            {looped.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="ReportCraft AI generated report"
                className="w-full rounded-lg border border-border shadow-sm"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
