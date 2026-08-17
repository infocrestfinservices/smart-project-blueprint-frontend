/**
 * invoiceService.js — the customer's own invoices.
 *
 * Every endpoint answers 404 for an invoice belonging to someone else, so a 404 here means
 * "not yours or not there" and never distinguishes the two. That is deliberate on the server:
 * invoice numbers are sequential, and a 403 would let anyone walk the series to learn how many
 * customers there are and when each of them paid.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("rc_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function get(path) {
  const res = await fetch(`${BACKEND_URL}/invoices${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `Could not load the invoice (${res.status})`);
  }
  return res.json();
}

export const listInvoices = () => get("");
export const getInvoice = (id) => get(`/${id}`);

/** Stream the PDF and save it under the invoice's own number. */
export async function downloadInvoicePdf(id, invoiceNumber) {
  const res = await fetch(`${BACKEND_URL}/invoices/${id}/pdf`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber || "invoice"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
