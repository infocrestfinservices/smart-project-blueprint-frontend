import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Pricing", to: "/pricing" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Create report", to: "/create" },
    ],
  },
  {
    title: "Formats",
    links: [
      { label: "CMA Data", to: "/create" },
      { label: "SBA / USA", to: "/create" },
      { label: "Feasibility Study", to: "/create" },
      { label: "Investor Pitch", to: "/create" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Reviews", to: "/#reviews" },
      { label: "My Reports", to: "/dashboard" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Contact", to: "/pricing" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-flex mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered feasibility studies and project reports — bank, scheme, and investor-ready
              in minutes, for Indian and global entrepreneurs.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© 2026 ReportCraft AI. Built for Indian &amp; global entrepreneurs.</p>
          <p className="inline-flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
