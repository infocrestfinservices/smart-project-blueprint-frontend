import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { purposes } from "@/lib/countryData";
import { FileText, Landmark, TrendingUp, ClipboardCheck, Briefcase, ScrollText, BookOpen } from "lucide-react";

const purposeIcons = {
  bank_loan: Landmark,
  feasibility_study: ClipboardCheck,
  government_scheme: ScrollText,
  investor_fundraising: TrendingUp,
  internal_planning: Briefcase
};

export default function StepPurpose({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Report Purpose & Format</h2>
        <p className="text-muted-foreground mt-1">Choose the purpose and format that fits your need</p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">What is this report for?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {purposes.map((p) => {
            const Icon = purposeIcons[p.value];
            const isSelected = data.purpose === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onChange({ purpose: p.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? "border-primary bg-accent shadow-sm"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {data.purpose === "government_scheme" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Government Scheme Name</Label>
          <Input
            placeholder="e.g. PMEGP, Startup India, MSME Subsidy"
            value={data.government_scheme_name || ""}
            onChange={(e) => onChange({ government_scheme_name: e.target.value })}
            className="h-11"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label className="text-sm font-medium">Report Format</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onChange({ report_format: "short" })}
            className={`p-5 rounded-xl border-2 text-left transition-all duration-200
              ${data.report_format === "short"
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${data.report_format === "short" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Short Format</p>
                <p className="text-xs text-muted-foreground mt-0.5">Executive summary style · 2-3 pages · Quick overview with key financials</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onChange({ report_format: "long" })}
            className={`p-5 rounded-xl border-2 text-left transition-all duration-200
              ${data.report_format === "long"
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${data.report_format === "long" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Long Format</p>
                <p className="text-xs text-muted-foreground mt-0.5">Comprehensive report · 10-15 pages · Full feasibility with detailed analysis</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}