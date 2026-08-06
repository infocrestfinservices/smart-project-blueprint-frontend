import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Loader2 } from "lucide-react";
import ReportCard from "@/components/report/ReportCard";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportStorage
      .list("-created_date", 50)
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await reportStorage.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <section id="reports" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold">My Reports</h3>
        <Link to="/create">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Report
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
          <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg">No reports yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Create your first project report to get started</p>
          <Link to="/create">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create First Report
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
