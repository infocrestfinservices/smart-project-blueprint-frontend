import React from "react";
import { Check } from "lucide-react";

const steps = [
  { label: "Basics", description: "Project & Industry" },
  { label: "Details", description: "Market & Financials" },
  { label: "Purpose", description: "Format & Goal" },
  { label: "Generate", description: "AI Report" }
];

export default function WizardProgress({ currentStep }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-10">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                  ${isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" : ""}
                  ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="text-center hidden sm:block">
                <p className={`text-xs font-semibold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${isCompleted ? "bg-primary" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}