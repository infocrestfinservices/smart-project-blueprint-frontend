import React from "react";
import { FileText, ImageUp } from "lucide-react";

// Real screenshots of generated reports, dropped in once available:
//   import shot1 from "@/assets/reports/shot1.png";
//   ...
//   const SCREENSHOTS = [shot1, shot2, shot3, shot4];
const SCREENSHOTS = [];

// A tall browser-chrome frame with the screenshots scrolling continuously
// inside it. Falls back to a friendly placeholder until the real
// screenshots are dropped into SCREENSHOTS above.
export default function ReportShowcase() {
  const looped = SCREENSHOTS.length ? [...SCREENSHOTS, ...SCREENSHOTS] : null;

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
          {looped ? (
            <div className="flex flex-col gap-4 p-4 animate-marquee-vertical">
              {looped.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="ReportCraft AI generated report"
                  className="w-full rounded-lg border border-border shadow-sm"
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                <ImageUp className="w-6 h-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                Live screenshots of real generated reports go here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
