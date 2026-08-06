import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReportCard from "@/components/report/ReportCard";
import { LandingNavbar, LandingFooter } from "@/components/landing";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    reportStorage
      .list("-created_date", 100)
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await reportStorage.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = reports.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [r.title, r.industry, r.country].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">My Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading
                ? "Loading your reports…"
                : `${reports.length} report${reports.length === 1 ? "" : "s"} generated`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports…"
                className="pl-9 w-56 bg-card"
              />
            </div>
            <Link to="/create">
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" /> New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            desc="Create your first project report to get started."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            desc={`Nothing matched "${query}". Try a different search.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
      <div className="w-16 h-16 mx-auto bg-card border rounded-2xl flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="font-heading font-semibold text-lg">{title}</h2>
      <p className="text-muted-foreground text-sm mt-1 mb-5">{desc}</p>
      <Link to="/create">
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Report
        </Button>
      </Link>
    </div>
  );
}
