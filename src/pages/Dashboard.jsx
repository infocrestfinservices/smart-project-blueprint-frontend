import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import ReportTable from "@/components/report/ReportTable";
import {
  Plus, FileText, Loader2, LogOut, LayoutDashboard,
  CheckCircle2, Clock, Zap, AlertCircle, Search, SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const STATUS_FILTERS = ["all", "completed", "generating", "draft", "failed"];

export default function Dashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      reportStorage.list("-updated_date", 100)
    ]).then(([r]) => {
      setReports(r);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await reportStorage.delete(id);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reports.filter(r => {
    const matchesSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.industry?.toLowerCase().includes(search.toLowerCase()) || r.country?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === "completed").length,
    draft: reports.filter(r => r.status === "draft").length,
    generating: reports.filter(r => r.status === "generating").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-lg font-heading font-bold hidden sm:block">ReportCraft AI</span>
            </Link>
            <span className="text-muted-foreground/40 hidden sm:block">·</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hidden sm:flex">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.full_name || user.email}
              </span>
            )}
            <Link to="/create">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Report</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => logout("/login")} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">My Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and download all your saved project reports.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Draft", value: stats.draft, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Generating", value: stats.generating, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-heading font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, industry, country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                  statusFilter === f
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base">
              {reports.length === 0 ? "No reports yet" : "No reports match your filters"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              {reports.length === 0 ? "Create your first project report to get started." : "Try adjusting your search or filters."}
            </p>
            {reports.length === 0 && (
              <Link to="/create">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Create First Report
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</p>
            <ReportTable reports={filtered} onDelete={handleDelete} />
          </>
        )}
      </main>
    </div>
  );
}