import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listTemplates } from "@/api/generationService";

/**
 * TemplateInputForm — "choose your model design" step.
 *
 * The sample workbooks are DESIGN BLUEPRINTS only. The user picks which
 * professional layout their report should look like; the AI then generates the
 * entire financial model from their chatbot answers and writes it into that
 * template's input cells (backend), so every number reflects THEIR business — no
 * sample data is ever copied. There are no manual value fields here on purpose.
 *
 * Props:
 *   purpose   - app purpose slug from the chat (e.g. "real_estate")
 *   onSubmit  - ({ templateId, cellAnswers }) => void   (cellAnswers always {})
 *   onSkip    - () => void   (no template for this purpose -> generic path)
 */
export default function TemplateInputForm({ purpose, onSubmit, onSkip }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTemplates(purpose)
      .then((res) => {
        if (cancelled) return;
        const avail = (res.templates || []).filter((t) => t.available);
        setTemplates(avail);
        if (avail.length === 0) {
          onSkip?.();
          return;
        }
        setActiveId(avail[0].id);
      })
      .catch((e) => !cancelled && setError(e?.message || "Could not load templates"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [purpose]);

  const generate = () => onSubmit?.({ templateId: activeId, cellAnswers: {} });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <h2 className="text-2xl font-heading font-bold">Choose your model design</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Pick the professional layout your Excel report should look like. The AI will build a
          <strong> complete financial model from your project details</strong> and fill this template —
          every figure, chart and KPI reflects <strong>your business</strong>, none of the sample's data.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading templates…
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  activeId === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-snug">{t.label}</p>
                  {activeId === t.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
                {t.currency && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {t.currency}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-card px-4 py-3 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center justify-end">
          <Button onClick={generate} disabled={loading || !activeId} className="gap-2">
            <Sparkles className="w-4 h-4" /> Generate My Report
          </Button>
        </div>
      </div>
    </div>
  );
}
