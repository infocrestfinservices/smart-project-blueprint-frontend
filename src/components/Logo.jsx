import React from "react";
import { FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Brand logo — gradient-free.
 * Solid navy tile with a document glyph and a small emerald "verified" badge,
 * paired with the ReportCraft AI wordmark.
 */
const SIZES = {
  sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", badge: "w-3.5 h-3.5", check: "w-2 h-2", title: "text-sm" },
  md: { box: "w-9 h-9 rounded-xl", icon: "w-5 h-5", badge: "w-4 h-4", check: "w-2.5 h-2.5", title: "text-base" },
  lg: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7", badge: "w-5 h-5", check: "w-3 h-3", title: "text-2xl" },
};

export default function Logo({ size = "md", showText = true, subtitle, className }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/15",
          s.box
        )}
      >
        <FileText className={s.icon} strokeWidth={2.25} aria-hidden="true" />
        {/* emerald "verified report" accent badge */}
        <span
          className={cn(
            "absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-background",
            s.badge
          )}
        >
          <Check className={s.check} strokeWidth={3.5} aria-hidden="true" />
        </span>
      </span>

      {showText && (
        <span className="leading-tight">
          <span className={cn("block font-heading font-bold tracking-tight text-foreground", s.title)}>
            ReportCraft <span className="text-emerald-600">AI</span>
          </span>
          {subtitle && (
            <span className="block text-[11px] text-muted-foreground -mt-0.5">{subtitle}</span>
          )}
        </span>
      )}
    </span>
  );
}
