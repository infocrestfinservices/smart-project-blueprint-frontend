import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import ReportViewer from "@/components/report/ReportViewer";
import { Loader2 } from "lucide-react";

export default function ViewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportStorage.get(id)
      .then(setReport)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <ReportViewer report={report} onBack={() => navigate("/")} />
    </div>
  );
}
