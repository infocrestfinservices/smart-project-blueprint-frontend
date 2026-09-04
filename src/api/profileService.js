/**
 * profileService.js — thin client for the backend /profile endpoints.
 * Mirrors the shape of authService.js / paymentService.js.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function extractError(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg?.replace(/^Value error,\s*/i, "") || fallback;
  }
  return fallback;
}

function authHeaders(hasBody) {
  const token = localStorage.getItem("rc_auth_token");
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: authHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractError(data, `Request failed (${res.status})`));
  return data;
}

export const profileService = {
  getProfile: () => request("/profile/me"),
  updateBasicInfo: (payload) => request("/profile/basic", { method: "PATCH", body: payload }),
  uploadAvatar: (dataUrl) => request("/profile/avatar", { method: "POST", body: { data_url: dataUrl } }),
  removeAvatar: () => request("/profile/avatar", { method: "DELETE" }),

  requestEmailChange: (newEmail, currentPassword) =>
    request("/profile/email/change", { method: "POST",
      body: { new_email: newEmail, current_password: currentPassword } }),
  verifyEmailChange: (otp) =>
    request("/profile/email/verify-change", { method: "POST", body: { otp } }),
  cancelEmailChange: () => request("/profile/email/cancel-change", { method: "POST", body: {} }),

  changePassword: (currentPassword, newPassword) =>
    request("/profile/password", { method: "POST",
      body: { current_password: currentPassword, new_password: newPassword } }),

  updateNotifications: (notifyEmail) =>
    request("/profile/notifications", { method: "PATCH", body: { notify_email: notifyEmail } }),
  updateTheme: (theme) => request("/profile/theme", { method: "PATCH", body: { theme } }),

  setup2FA: () => request("/profile/2fa/setup", { method: "POST", body: {} }),
  confirm2FA: (code) => request("/profile/2fa/confirm", { method: "POST", body: { code } }),
  disable2FA: (currentPassword) =>
    request("/profile/2fa/disable", { method: "POST", body: { current_password: currentPassword } }),

  deleteAccount: (currentPassword) =>
    request("/profile/me", { method: "DELETE", body: { current_password: currentPassword } }),
};
