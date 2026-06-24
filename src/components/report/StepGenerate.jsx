import React from "react";
import { formatCurrency } from "@/lib/countryData";
import { purposes } from "@/lib/countryData";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StepGenerate({ data, isGenerating, onGenerate }) {
  const purposeLabel = purposes.find(p => p.value === data.purpose)?.label || data.purpose;

  const summaryItems = [
    { label: "Project", value: data.title },
    { label: "Industry", value: [data.industry, data.sub_industry].filter(Boolean).join(" — ") },
    { label: "Country", value: `${data.country} (${data.currency})` },
    { label: "Location", value: data.location },
    { label: "Promoter", value: data.promoter_name },
    { label: "Total Cost", value: formatCurrency(data.project_cost, data.currency) },
    { label: "Own Contribution", value: data.own_contribution ? formatCurrency(data.own_contribution, data.currency) : null },
    { label: "Funding Required", value: data.loan_amount ? formatCurrency(data.loan_amount, data.currency) : null },
    { label: "Purpose", value: purposeLabel },
    { label: "Scheme", value: data.government_scheme_name },
    { label: "Format", value: data.report_format === "short" ? "Short Format" : "Long Format (Detailed)" },
  ].filter(item => item.value);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Review & Generate</h2>
        <p className="text-muted-foreground mt-1">Confirm your details before generating</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full h-14 text-base font-semibold"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating your report — this may take a minute...
          </>
        ) : (
          "Generate Project Report"
        )}
      </Button>

      {isGenerating && (
        <p className="text-center text-sm text-muted-foreground">
          Our AI is crafting a professional {data.report_format === "short" ? "short-format" : "detailed long-format"} report customized for {purposeLabel.toLowerCase()}.
        </p>
      )}
    </div>
  );
}