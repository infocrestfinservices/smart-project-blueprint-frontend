import React from "react";
import { Check, X } from "lucide-react";
import { passwordRules } from "@/lib/passwordRules";
import { cn } from "@/lib/utils";

/**
 * Live checklist showing which password requirements are met.
 * Renders nothing until the user starts typing.
 */
export default function PasswordChecklist({ password = "" }) {
  if (!password) return null;

  return (
    <ul className="mt-2 space-y-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs",
              passed ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {passed ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
