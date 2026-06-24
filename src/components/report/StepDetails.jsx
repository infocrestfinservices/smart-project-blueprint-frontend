import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countries } from "@/lib/countryData";
import { Target, Users, DollarSign, Wallet } from "lucide-react";

export default function StepDetails({ data, onChange }) {
  const country = countries.find(c => c.name === data.country);
  const symbol = country?.symbol || "$";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Market & Financial Details</h2>
        <p className="text-muted-foreground mt-1">Define your market and project financials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4 text-primary" /> Target Market
          </Label>
          <Textarea
            placeholder="e.g. Domestic market in Tier 1 & Tier 2 cities, with potential for export to Southeast Asia"
            value={data.target_market || ""}
            onChange={(e) => onChange({ target_market: e.target.value })}
            rows={3}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-primary" /> Target Customers
          </Label>
          <Textarea
            placeholder="e.g. B2B clients in construction industry, government departments, and retail consumers aged 25-50"
            value={data.target_customers || ""}
            onChange={(e) => onChange({ target_customers: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-primary" /> Total Project Cost ({symbol})
          </Label>
          <Input
            type="number"
            placeholder="e.g. 5000000"
            value={data.project_cost || ""}
            onChange={(e) => onChange({ project_cost: parseFloat(e.target.value) || 0 })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="w-4 h-4 text-primary" /> Own Contribution ({symbol})
          </Label>
          <Input
            type="number"
            placeholder="e.g. 1500000"
            value={data.own_contribution || ""}
            onChange={(e) => onChange({ own_contribution: parseFloat(e.target.value) || 0 })}
            className="h-11"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-primary" /> Loan / Funding Required ({symbol})
          </Label>
          <Input
            type="number"
            placeholder="e.g. 3500000"
            value={data.loan_amount || ""}
            onChange={(e) => onChange({ loan_amount: parseFloat(e.target.value) || 0 })}
            className="h-11"
          />
          {data.project_cost > 0 && data.own_contribution > 0 && (
            <p className="text-xs text-muted-foreground">
              Debt-Equity Ratio: {((data.project_cost - data.own_contribution) / (data.own_contribution || 1)).toFixed(2)}:1
            </p>
          )}
        </div>
      </div>
    </div>
  );
}