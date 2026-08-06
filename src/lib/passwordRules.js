/**
 * Shared password policy used by the registration and reset-password forms.
 * Must stay in sync with the backend rules in services/auth_service.py.
 */

export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "One number", test: (v) => /\d/.test(v) },
];

/** True only when every rule passes. */
export const isPasswordValid = (value) =>
  passwordRules.every((rule) => rule.test(value || ""));

/** The label of the first unmet rule, or null when the password is valid. */
export const firstPasswordError = (value) => {
  const failed = passwordRules.find((rule) => !rule.test(value || ""));
  return failed ? failed.label : null;
};
