import React, { useState, useRef, useEffect } from "react";
import ReportRenderer from "@/components/report/ReportRenderer";
import ExcelUploadModal from "@/components/report/ExcelUploadModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, ArrowLeft, FileText, Palette, Edit3, Save, X, RefreshCw, Loader2, Check, ChevronDown, ChevronUp, Download, FileSpreadsheet, FileType, Cloud, CloudOff, ImagePlus, Paintbrush } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { reportStorage } from "@/api/localStorageService";
import { invokeLLM } from "@/api/llmService";
import { formatCurrency, purposes } from "@/lib/countryData";
import { exportToPDF, exportToWord, exportFinancialsToExcel } from "@/lib/exportUtils";
import { useAutoSave } from "@/hooks/useAutoSave";

const COLOR_THEMES = [
  { name: "Indigo", primary: "#4f46e5", light: "#eef2ff", text: "#3730a3" },
  { name: "Emerald", primary: "#059669", light: "#ecfdf5", text: "#065f46" },
  { name: "Rose", primary: "#e11d48", light: "#fff1f2", text: "#9f1239" },
  { name: "Amber", primary: "#d97706", light: "#fffbeb", text: "#92400e" },
  { name: "Blue", primary: "#2563eb", light: "#eff6ff", text: "#1e40af" },
  { name: "Violet", primary: "#7c3aed", light: "#f5f3ff", text: "#5b21b6" },
  { name: "Slate", primary: "#475569", light: "#f8fafc", text: "#1e293b" },
  { name: "Teal", primary: "#0d9488", light: "#f0fdfa", text: "#134e4a" },
];

const EDITABLE_FIELDS = [
  { key: "title", label: "Project Title", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "promoter_name", label: "Promoter / Company Name", type: "text" },
  { key: "promoter_experience", label: "Promoter Experience", type: "text" },
  { key: "project_cost", label: "Total Project Cost", type: "number" },
  { key: "own_contribution", label: "Own Contribution", type: "number" },
  { key: "loan_amount", label: "Loan / Funding Required", type: "number" },
  { key: "target_market", label: "Target Market", type: "textarea" },
  { key: "target_customers", label: "Target Customers", type: "textarea" },
  { key: "project_description", label: "Project Description", type: "textarea" },
];

export default function ReportViewer({ report: initialReport, onBack }) {
  const { toast } = useToast();
  const [report, setReport] = useState(initialReport);
  const [theme, setTheme] = useState(COLOR_THEMES[0]);
  const [showPalette, setShowPalette] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(report.report_content || "");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved"
  const exportMenuRef = useRef(null);
  const logoInputRef = useRef(null);

  const purposeLabel = purposes.find(p => p.value === report.purpose)?.label || report.purpose;

  // Auto-save hook
  const { save: autoSave, getLocalBackup, clearLocalBackup } = useAutoSave(report.id, editedContent, {
    debounceMs: 4000,
    onSaved: () => setAutoSaveStatus("saved"),
    onError: () => setAutoSaveStatus("unsaved"),
  });

  // Check for local backup on mount
  useEffect(() => {
    const backup = getLocalBackup();
    if (backup && backup.content !== report.report_content) {
      toast({
        title: "Unsaved changes found",
        description: `A local backup from ${new Date(backup.savedAt).toLocaleTimeString()} was found. Restoring...`,
      });
      setEditedContent(backup.content);
      setReport(prev => ({ ...prev, report_content: backup.content }));
    }
  }, []);

  // Mark unsaved when editedContent changes
  useEffect(() => {
    if (editedContent !== report.report_content) setAutoSaveStatus("saving");
  }, [editedContent]);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e) => { if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setShowExportMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startEditField = (field) => {
    setEditingField(field.key);
    setFieldValues({ [field.key]: report[field.key] || "" });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setFieldValues({});
  };

  const saveFieldAndRegenerate = async (fieldKey) => {
    const newValue = fieldValues[fieldKey];
    const updatedReport = { ...report, [fieldKey]: newValue };
    setReport(updatedReport);
    setEditingField(null);

    // Save field immediately
    await reportStorage.update(report.id, { [fieldKey]: newValue });

    // Ask if they want to regenerate
    toast({
      title: "Field updated!",
      description: "Click 'Regenerate Report' to rebuild the report with updated details.",
    });
  };

  const regenerateReport = async () => {
    setIsRegenerating(true);
    try {
      const isLong = report.report_format === "long";
      const curr = report.currency || "USD";

      const prompt = `You are an expert project report writer. Regenerate the complete project report with the UPDATED information below.

**Project Title:** ${report.title}
**Industry:** ${report.industry}${report.sub_industry ? ` — ${report.sub_industry}` : ""}
**Country:** ${report.country} | **Currency:** ${curr}
**Location:** ${report.location || "Not specified"}
**Promoter/Company:** ${report.promoter_name || "Not specified"}
**Experience:** ${report.promoter_experience || "Not specified"}
**Description:** ${report.project_description}
**Target Market:** ${report.target_market}
**Target Customers:** ${report.target_customers}
**Total Project Cost:** ${curr} ${Number(report.project_cost).toLocaleString()}
**Own Contribution:** ${curr} ${Number(report.own_contribution).toLocaleString()}
**Loan/Funding Required:** ${curr} ${Number(report.loan_amount).toLocaleString()}
**Purpose:** ${purposeLabel}
${report.government_scheme_name ? `**Government Scheme:** ${report.government_scheme_name}` : ""}

Generate a ${isLong ? "comprehensive long-format (10-15 pages)" : "concise short-format (2-3 pages)"} project report.

${isLong ? `SECTIONS: Executive Summary, Promoter Profile, Project Overview, Industry & Market Analysis, Products/Services, Target Market, Marketing Strategy, Operations Plan, Technology, Manpower, Project Cost & Means of Finance, Revenue Projections, Projected P&L, Break-Even Analysis, Cash Flow Statement, SWOT Analysis, Risk Assessment, Implementation Timeline, Social Impact, Conclusion.` : `SECTIONS: Executive Summary, Project Overview, Promoter Profile, Market Opportunity, Project Cost & Funding, Revenue & Profitability Summary, Key Strengths & Risks, Conclusion.`}

Purpose-specific: ${report.purpose === "bank_loan" ? "Emphasize repayment capacity, DSCR, collateral. Include Loan Repayment Schedule table." : report.purpose === "investor_fundraising" ? "Emphasize market opportunity, ROI, scalability, exit strategy." : report.purpose === "government_scheme" ? "Emphasize employment generation, social impact, subsidy utilization." : "Emphasize feasibility, SWOT, risk assessment."}

FORMATTING RULES (STRICTLY FOLLOW):
- ALL financial data MUST be in well-structured markdown tables — never prose.
- Project Cost & Means of Finance table: columns = Sr. No. | Particulars | Amount (${curr}) | % of Total
- Projected P&L table: rows = Revenue, COGS, Gross Profit, EBITDA, EBIT, Interest, PAT — columns = Year 1–5 (or Year 1–3 for short format).
- Revenue Projections table: rows = Revenue streams, columns = Year 1–5.
- Break-Even Analysis table: Fixed Costs | Variable Cost % | Break-Even Revenue.
- Use ## for section headings, ### for sub-sections.
- All numbers internally consistent. No filler text — every line must be project-specific.`;

      const newContent = await invokeLLM({ prompt, model: "claude_sonnet_4_6" });
      await reportStorage.update(report.id, { report_content: newContent });
      setReport(prev => ({ ...prev, report_content: newContent }));
      setEditedContent(newContent);
      toast({ title: "Report Regenerated!", description: "Your report has been updated with the latest details." });
    } catch (err) {
      toast({ title: "Failed", description: "Could not regenerate report.", variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  const saveEditedContent = async () => {
    setIsSavingContent(true);
    try {
      await reportStorage.update(report.id, { report_content: editedContent });
      setReport(prev => ({ ...prev, report_content: editedContent }));
      setIsEditingContent(false);
      toast({ title: "Saved!", description: "Report content updated." });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report.report_content || "");
    toast({ title: "Copied!", description: "Report copied to clipboard." });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      // Simulated local logo load with FileReader instead of backend upload
      const reader = new FileReader();
      reader.onload = async (event) => {
        const file_url = event.target.result;
        await reportStorage.update(report.id, { logo_url: file_url });
        setReport(prev => ({ ...prev, logo_url: file_url }));
        toast({ title: "Logo uploaded!", description: "Your logo will appear on exported PDFs." });
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBrandColorChange = async (color) => {
    setReport(prev => ({ ...prev, brand_color: color }));
    await reportStorage.update(report.id, { brand_color: color });
  };

  const handleExportPDF = () => { setShowExportMenu(false); exportToPDF(report, theme); };
  const handleExportWord = () => { setShowExportMenu(false); exportToWord(report); };
  const handleExportExcel = () => { setShowExportMenu(false); exportFinancialsToExcel(report); };

  const regenerateFromExcel = async (excelMarkdown) => {
    setIsRegenerating(true);
    try {
      const curr = report.currency || "USD";
      const prompt = `You are an expert project report writer. The user has revised the financial projections in Excel. Regenerate the COMPLETE project report using the REVISED financial data below.

REVISED FINANCIAL DATA (from uploaded Excel):
${excelMarkdown}

PROJECT CONTEXT:
**Title:** ${report.title}
**Industry:** ${report.industry} | **Country:** ${report.country} | **Currency:** ${curr}
**Location:** ${report.location || "N/A"} | **Promoter:** ${report.promoter_name || "N/A"}
**Description:** ${report.project_description || ""}
**Purpose:** ${purposeLabel}

IMPORTANT: Use the REVISED numbers from the Excel data above as the authoritative financial figures. Regenerate all narrative text, analysis, and projections to be consistent with the revised numbers.

FORMATTING RULES:
- ALL financial tables in proper markdown table format.
- P&L table: rows = Revenue, COGS, Gross Profit, EBITDA, EBIT, Interest, PAT — columns = years.
- Use ## for sections, ### for sub-sections.
- Keep the same section structure as the original report but update all numbers.`;

      const newContent = await invokeLLM({ prompt, model: "claude_sonnet_4_6" });
      await reportStorage.update(report.id, { report_content: newContent });
      setReport(prev => ({ ...prev, report_content: newContent }));
      setEditedContent(newContent);
      clearLocalBackup();
      toast({ title: "Report Regenerated!", description: "Report updated with your revised financial figures." });
    } catch {
      toast({ title: "Regeneration failed", variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap">

          {/* Auto-save indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
            {autoSaveStatus === "saving" ? (
              <><Loader2 className="w-3 h-3 animate-spin" /><span className="hidden sm:inline">Saving…</span></>
            ) : autoSaveStatus === "saved" ? (
              <><Cloud className="w-3 h-3 text-emerald-500" /><span className="hidden sm:inline text-emerald-600">Saved</span></>
            ) : (
              <><CloudOff className="w-3 h-3 text-amber-500" /><span className="hidden sm:inline text-amber-600">Unsaved</span></>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowPalette(!showPalette)} className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Theme</span>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBranding(!showBranding)} className="gap-2">
            <Paintbrush className="w-4 h-4" />
            <span className="hidden sm:inline">Branding</span>
            {report.brand_color && <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: report.brand_color }} />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="gap-2">
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Details</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={regenerateReport}
            disabled={isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="hidden sm:inline">{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
          </Button>

          {/* Export Excel (financials) */}
          <Button variant="outline" size="sm" onClick={() => setShowExcelModal(true)} className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>

          {/* Export dropdown (PDF / Word) */}
          <div className="relative" ref={exportMenuRef}>
            <Button variant="outline" size="sm" onClick={() => setShowExportMenu(v => !v)} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-card border rounded-xl shadow-lg py-1.5 w-44 z-20">
                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors">
                  <FileText className="w-4 h-4 text-red-500" /> Export as PDF
                </button>
                <button onClick={handleExportWord} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors">
                  <FileType className="w-4 h-4 text-blue-500" /> Export as Word
                </button>
                <div className="border-t my-1" />
                <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Financials
                </button>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
        </div>
      </div>

      {/* Color palette */}
      {showPalette && (
        <div className="bg-card border rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-muted-foreground">Report Color Theme:</span>
          {COLOR_THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => { setTheme(t); setShowPalette(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all"
              style={{
                borderColor: theme.name === t.name ? t.primary : "transparent",
                backgroundColor: t.light,
                color: t.text
              }}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
              {t.name}
              {theme.name === t.name && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}

      {/* Branding panel */}
      {showBranding && (
        <div className="bg-card border rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Paintbrush className="w-4 h-4 text-primary" /> Branding for PDF Export</h3>
            <p className="text-xs text-muted-foreground">Logo and color appear on the cover page and headers of every exported PDF</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo upload */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Business Logo</Label>
              <div className="flex items-center gap-3">
                {report.logo_url ? (
                  <div className="relative group">
                    <img src={report.logo_url} alt="Logo" className="h-14 max-w-[140px] object-contain rounded-lg border bg-white p-1.5" />
                    <button
                      onClick={() => { handleBrandColorChange(report.brand_color); reportStorage.update(report.id, { logo_url: "" }); setReport(p => ({ ...p, logo_url: "" })); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    ><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="gap-2">
                    {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                    {report.logo_url ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG — max 2MB</p>
                </div>
              </div>
            </div>

            {/* Brand color */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Brand Color (overrides theme in PDF)</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <input
                    type="color"
                    value={report.brand_color || theme.primary}
                    onChange={(e) => handleBrandColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                    title="Pick brand color"
                  />
                </div>
                <span className="text-sm font-mono text-muted-foreground">{report.brand_color || theme.primary}</span>
                {/* Quick presets */}
                <div className="flex gap-1.5 flex-wrap">
                  {["#4f46e5","#059669","#2563eb","#dc2626","#d97706","#7c3aed","#0891b2","#1e293b"].map(c => (
                    <button
                      key={c}
                      onClick={() => handleBrandColorChange(c)}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: c, borderColor: report.brand_color === c ? "#000" : "transparent" }}
                      title={c}
                    />
                  ))}
                </div>
                {report.brand_color && (
                  <button onClick={() => handleBrandColorChange("")} className="text-xs text-muted-foreground underline">Reset</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editable details panel */}
      {showDetails && (
        <div className="bg-card border rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Edit Report Details</h3>
            <p className="text-xs text-muted-foreground">Edit fields below, then click "Regenerate" to rebuild the report</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EDITABLE_FIELDS.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label className="text-xs text-muted-foreground mb-1 block">{field.label}</Label>
                {editingField === field.key ? (
                  <div className="flex gap-2 items-start">
                    {field.type === "textarea" ? (
                      <Textarea
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => setFieldValues({ [field.key]: e.target.value })}
                        className="text-sm"
                        rows={2}
                        autoFocus
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => setFieldValues({ [field.key]: field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                        className="text-sm h-9"
                        autoFocus
                      />
                    )}
                    <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => saveFieldAndRegenerate(field.key)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-accent/50 transition-all group text-sm"
                    onClick={() => startEditField(field)}
                  >
                    <span className="text-foreground">
                      {field.type === "number"
                        ? report[field.key] ? formatCurrency(report[field.key], report.currency) : "—"
                        : report[field.key] || "—"
                      }
                    </span>
                    <Edit3 className="w-3 h-3 text-muted-foreground ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> After editing, click <strong>"Regenerate"</strong> in the toolbar to rebuild the full report.
          </p>
        </div>
      )}

      {/* Report document */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {/* Report header with theme color */}
        <div className="px-8 py-7" style={{ backgroundColor: report.brand_color || theme.primary }}>
          <div className="flex items-center gap-3 mb-3">
            {report.logo_url ? (
              <img src={report.logo_url} alt="Logo" className="h-10 max-w-[120px] object-contain rounded bg-white/10 p-1" />
            ) : (
              <div className="p-2 rounded-lg bg-white/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Project Report</p>
              <p className="text-white/60 text-xs">{report.report_format === "short" ? "Short Format" : "Long Format"} · {purposeLabel}</p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white leading-tight">{report.title}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            {[report.industry, report.country, report.location].filter(Boolean).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Key stats bar */}
        <div className="grid grid-cols-3 divide-x border-b" style={{ backgroundColor: theme.light }}>
          {[
            { label: "Total Cost", value: formatCurrency(report.project_cost, report.currency) },
            { label: "Own Contribution", value: formatCurrency(report.own_contribution, report.currency) },
            { label: "Funding Required", value: formatCurrency(report.loan_amount, report.currency) },
          ].map((stat) => (
            <div key={stat.label} className="px-4 sm:px-6 py-3 text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-bold text-sm sm:text-base mt-0.5" style={{ color: theme.text }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="px-6 sm:px-10 py-8">
          {isEditingContent ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Editing report content (Markdown)</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEditedContent} disabled={isSavingContent} className="gap-1.5">
                    {isSavingContent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setIsEditingContent(false); setEditedContent(report.report_content || ""); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="font-mono text-xs min-h-[600px] resize-y"
              />
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={() => { setIsEditingContent(true); setEditedContent(report.report_content || ""); }}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-card border rounded-lg px-2.5 py-1.5 shadow-sm z-10"
              >
                <Edit3 className="w-3 h-3" /> Edit Content
              </button>
              <ReportRenderer content={report.report_content} theme={theme} />
            </div>
          )}
        </div>
      </div>

      {showExcelModal && (
        <ExcelUploadModal
          report={report}
          onClose={() => setShowExcelModal(false)}
          onRegenerate={regenerateFromExcel}
        />
      )}
    </div>
  );
}