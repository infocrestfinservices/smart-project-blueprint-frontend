/**
 * generationService.js
 *
 * Talks to the backend purpose-driven generation pipeline:
 *  - generateModel(): runs agents + builds the structured model (returns preview)
 *  - downloadExcel() / downloadWord(): stream the .xlsx / .docx deliverables
 *
 * Files are fetched with the JWT (the endpoints require auth + ownership), then
 * saved client-side — a plain <a href> download would not send the token.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function authHeaders(json = true) {
  const token = localStorage.getItem("rc_auth_token");
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function generateModel(projectId, purposeAnswers = {}, templateId = null,
                                    refreshInputs = false, instructions = undefined,
                                    withWordReport = false) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      purpose_answers: purposeAnswers,
      template_id: templateId,
      // false => rebuild from the inputs already on file, so a regeneration
      // reproduces the same model instead of inventing a new business.
      refresh_inputs: refreshInputs,
      // The written report is the one expensive call in the pipeline (minutes of
      // reasoning), and the workbook does not use a word of it — so it is OFF unless
      // asked for. Without it the Word file still builds, but its Executive Summary,
      // Business Model and References are the sections that never get written.
      excel_only: !withWordReport,
      // the user's own words about what this report should contain
      ...(instructions !== undefined ? { instructions } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Generation failed (${res.status})`);
  return data;
}

// The inputs this project's model was built from, labelled — shown for review before a
// regeneration so the user can correct anything instead of re-running blind.
export async function getProjectAnswers(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/answers`, {
    headers: authHeaders(false),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not load your answers (${res.status})`);
  return data; // { project, template, fields: [{key,label,value,type,options}] }
}

// Fetch the sample templates offered for a purpose (app slug or canonical key).
export async function listTemplates(purpose) {
  const res = await fetch(`${BACKEND_URL}/templates/${encodeURIComponent(purpose)}`, {
    headers: authHeaders(false),
  });
  if (!res.ok) throw new Error(`Could not load templates (${res.status})`);
  return res.json(); // { purpose_key, purpose_label, templates: [...] }
}

// Fetch a template's input schema (the questions to ask, grouped by sheet).
export async function getTemplateSchema(purpose, templateId) {
  const res = await fetch(`${BACKEND_URL}/templates/${encodeURIComponent(purpose)}/${encodeURIComponent(templateId)}/schema`, {
    headers: authHeaders(false),
  });
  if (!res.ok) throw new Error(`Could not load template inputs (${res.status})`);
  return res.json(); // { label, purpose_key, template_id, groups: [...] }
}

async function streamDownload(projectId, kind) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/${kind}`, {
    headers: authHeaders(false),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.detail || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const m = cd.match(/filename="?([^"]+)"?/);
  // Prefer the server's real filename (needs Content-Disposition exposed via
  // CORS). If unavailable, derive the extension from the Content-Type so a
  // macro workbook (.xlsm) is never mis-saved as .xlsx — which corrupts it.
  const ct = res.headers.get("Content-Type") || blob.type || "";
  const fallbackExt = kind !== "excel"
    ? "docx"
    : ct.includes("macroEnabled") ? "xlsm" : "xlsx";
  const name = m ? m[1] : `report.${fallbackExt}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const downloadExcel = (projectId) => streamDownload(projectId, "excel");
export const downloadWord = (projectId) => streamDownload(projectId, "word");

// Logo + brand colour for this project's report. Stored server-side (in the project's
// answers blob, so no schema change) and used by the Word document as well as the UI.
export async function saveBranding(projectId, { logoUrl, brandColor } = {}) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/branding`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      ...(logoUrl !== undefined ? { logo_url: logoUrl } : {}),
      ...(brandColor !== undefined ? { brand_color: brandColor } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not save branding (${res.status})`);
  return data; // { logo_url, brand_color }
}

export async function getBranding(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/branding`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { logo_url: "", brand_color: "" };
  return res.json();
}

// The client's own images, placed at the end of a named section of the report. The whole
// list is sent on every save — the same shape as branding, so adding and removing are one
// code path and cannot get out of step with what the server holds.
export async function getReportSections(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/sections`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { sections: [] };
  return res.json(); // { sections: ["Executive Summary", ...] }
}

export async function getInserts(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/inserts`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { inserts: [] };
  return res.json(); // { inserts: [{ section, data_url, caption }] }
}

export async function saveInserts(projectId, inserts) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/inserts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ inserts }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not save the inserts (${res.status})`);
  return data;
}
