import React from "react";
import { REPORT_TEMPLATES } from "@/lib/reportTemplates";

export default function TemplateSelector({ onSelect }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold">Choose a Report Template</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Select the template that best matches your industry for a more tailored report structure
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {REPORT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group p-4 sm:p-5 rounded-xl border-2 border-border bg-card text-left hover:shadow-md transition-all duration-200 hover:border-opacity-100"
              style={{ "--hover-color": template.color }}
              onMouseEnter={e => e.currentTarget.style.borderColor = template.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = ""}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ backgroundColor: template.lightColor }}
              >
                {template.icon}
              </div>
              <p className="font-semibold text-sm leading-snug">{template.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{template.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {template.examples.slice(0, 2).map(ex => (
                  <span
                    key={ex}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: template.lightColor, color: template.color }}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}