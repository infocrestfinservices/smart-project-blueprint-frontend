import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { countries, industries } from "@/lib/countryData";
import { Building2, Globe, MapPin, User } from "lucide-react";

export default function StepBasics({ data, onChange }) {
  const handleCountryChange = (countryName) => {
    const country = countries.find(c => c.name === countryName);
    onChange({
      country: countryName,
      currency: country?.currency || "USD"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Tell us about your project</h2>
        <p className="text-muted-foreground mt-1">Basic information to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-primary" /> Project Title
          </Label>
          <Input
            placeholder="e.g. Solar Panel Manufacturing Unit"
            value={data.title || ""}
            onChange={(e) => onChange({ title: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-primary" /> Industry
          </Label>
          <Select value={data.industry || ""} onValueChange={(v) => onChange({ industry: v })}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Sub-Industry / Niche</Label>
          <Input
            placeholder="e.g. Organic Food Processing"
            value={data.sub_industry || ""}
            onChange={(e) => onChange({ sub_industry: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4 text-primary" /> Country
          </Label>
          <Select value={data.country || ""} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.name}>{c.name} ({c.currency})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" /> Project Location
          </Label>
          <Input
            placeholder="City, State / Region"
            value={data.location || ""}
            onChange={(e) => onChange({ location: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-primary" /> Promoter / Company Name
          </Label>
          <Input
            placeholder="e.g. ABC Enterprises Pvt. Ltd."
            value={data.promoter_name || ""}
            onChange={(e) => onChange({ promoter_name: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Promoter's Experience</Label>
          <Input
            placeholder="e.g. 10 years in textile manufacturing"
            value={data.promoter_experience || ""}
            onChange={(e) => onChange({ promoter_experience: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-medium">Brief Project Description</Label>
          <Textarea
            placeholder="Describe your project in 2-3 sentences..."
            value={data.project_description || ""}
            onChange={(e) => onChange({ project_description: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}