/**
 * Auth Service
 *
 * Thin client for the backend /auth endpoints. Tokens are stored by
 * AuthContext; this module only performs the network calls.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/** Pull a human-readable message out of a FastAPI error response body. */
function extractError(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  // Pydantic validation errors come back as an array of { loc, msg, type }.
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg?.replace(/^Value error,\s*/i, "") || fallback;
  }
  return fallback;
}

// Hard ceiling so a slow/unresponsive backend surfaces an error instead of
// leaving the UI stuck on a spinner forever.
const REQUEST_TIMEOUT_MS = 15000;

async function request(path, { method = "POST", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    throw new Error("Cannot reach the server. Please check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractError(data, `Request failed (${response.status})`));
  }
  return data;
}

export const authService = {
  register: ({ email, password, full_name }) =>
    request("/auth/register", { body: { email, password, full_name } }),

  login: ({ email, password }) =>
    request("/auth/login", { body: { email, password } }),

  // Second factor: exchanges the challenge_token from login() + a TOTP/backup code for a
  // real access token. See routers/auth_router.py:verify_login_2fa.
  verifyTwoFactorLogin: (challenge_token, code) =>
    request("/auth/2fa/verify-login", { body: { challenge_token, code } }),

  me: (token) => request("/auth/me", { method: "GET", token }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", { body: { email } }),

  resetPassword: (token, new_password) =>
    request("/auth/reset-password", { body: { token, new_password } }),

  verifyEmail: (email, otp) =>
    request("/auth/verify-email", { body: { email, otp } }),

  resendOtp: (email) =>
    request("/auth/resend-otp", { body: { email } }),
};
