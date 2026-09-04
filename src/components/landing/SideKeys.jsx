import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useHasReports } from "@/lib/useHasReports";
import { User } from "lucide-react";

// A single pill on the left edge, pointing at /profile — My Reports, Account and Admin
// used to each get their own pill here; they're now tabs inside the Profile page itself
// (the way most apps do it), so one entry point is all the nav needs. Only earns its
// place once the user actually has a report to look at.
export default function SideKeys() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hasReports = useHasReports();

  if (!user || !hasReports) return null;

  const items = [
    { label: "Profile", to: "/profile", icon: User },
  ];

  const isActive = (to) => pathname.startsWith(to);

  return (
    <div className="hidden md:flex fixed left-3 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">
      {items.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          title={it.label}
          className={`group flex items-center gap-2 h-9 px-2.5 rounded-full border shadow-sm transition-all overflow-hidden ${
            isActive(it.to)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/95 backdrop-blur text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
          }`}
        >
          <it.icon className="w-4 h-4 shrink-0" />
          <span className="text-xs font-medium max-w-0 group-hover:max-w-[100px] transition-[max-width] duration-300 whitespace-nowrap">
            {it.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
