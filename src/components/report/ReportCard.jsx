import React from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, purposes } from "@/lib/countryData";
import moment from "moment";

export default function ReportCard({ report, onDelete }) {
  const purposeLabel = purposes.find(p => p.value === report.purpose)?.label || report.purpose;

  return (
    <div className="bg-card rounded-xl border p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {report.industry} · {report.country}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {report.report_format === "short" ? "Short" : "Long"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {purposeLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(report.project_cost, report.currency)}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 flex-shrink-0"
          onClick={(e) => { e.preventDefault(); onDelete(report.id); }}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <span className="text-xs text-muted-foreground">
          {moment(report.created_date).format("MMM D, YYYY · h:mm A")}
        </span>
        <Link to={`/report/${report.id}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
            View Report <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}