const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const getHeaders = (includeContent = true) => {
  const token = localStorage.getItem("rc_auth_token");
  const headers = {};
  if (includeContent) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const reportStorage = {

  async list(sortField = "-created_date", limit = 100) {
    const response = await fetch(`${BACKEND_URL}/projects/`, {
      headers: getHeaders(false),
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    const projects = await response.json();
    return projects.map(p => ({
      ...p,
      id: String(p.id),
      created_date: p.created_at,
      updated_date: p.created_at,
    }));
  },

  async get(id) {
    const projectRes = await fetch(`${BACKEND_URL}/projects/${id}`, {
      headers: getHeaders(false),
    });
    if (!projectRes.ok) throw new Error("Project not found");
    const project = await projectRes.json();

    const reportRes = await fetch(`${BACKEND_URL}/projects/${id}/report`, {
      headers: getHeaders(false),
    });
    if (!reportRes.ok) {
      return {
        ...project,
        id: String(project.id),
        created_date: project.created_at,
        updated_date: project.created_at,
        report_content: null,
      };
    }
    const report = await reportRes.json();
    return {
      ...project,
      ...report,
      id: String(project.id),
      created_date: project.created_at,
      updated_date: project.created_at,
    };
  },

  async create(data) {
    const projectRes = await fetch(`${BACKEND_URL}/projects/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        title: data.title || "Untitled Project",
        industry: data.industry || null,
        sub_industry: data.sub_industry || null,
        country: data.country || null,
        currency: data.currency || null,
        location: data.location || null,
        promoter_name: data.promoter_name || null,
        promoter_experience: data.promoter_experience || null,
        project_description: data.project_description || null,
        target_market: data.target_market || null,
        target_customers: data.target_customers || null,
        project_cost: data.project_cost || null,
        own_contribution: data.own_contribution || null,
        loan_amount: data.loan_amount || null,
        purpose: data.purpose || null,
        government_scheme_name: data.government_scheme_name || null,
        report_format: data.report_format || null,
        financial_format: data.financial_format || null,
      }),
    });
    if (!projectRes.ok) throw new Error("Failed to create project");
    const project = await projectRes.json();

    if (data.report_content) {
      await fetch(`${BACKEND_URL}/projects/${project.id}/report`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          report_content: data.report_content,
          report_format: data.report_format || null,
          financial_format: data.financial_format || null,
        }),
      });
    }

    return {
      ...project,
      id: String(project.id),
      created_date: project.created_at,
      updated_date: project.created_at,
    };
  },

  async update(id, fields) {
    if (fields.report_content) {
      const reportRes = await fetch(`${BACKEND_URL}/projects/${id}/report`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          report_content: fields.report_content,
          report_format: fields.report_format || null,
          financial_format: fields.financial_format || null,
        }),
      });
      if (!reportRes.ok) throw new Error("Failed to update report");
      const report = await reportRes.json();
      return {
        ...report,
        id: String(id),
        created_date: report.created_at,
        updated_date: report.created_at,
      };
    }
    // Anything that isn't report content is a project detail. This used to return the
    // fields straight back without contacting the server, so "Edit Details" reported
    // success and the old value reappeared on the next refresh.
    const res = await fetch(`${BACKEND_URL}/projects/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error("Failed to update project");
    const project = await res.json();
    return {
      ...project,
      id: String(project.id),
      created_date: project.created_at,
      updated_date: project.created_at,
    };
  },

  async delete(id) {
    const response = await fetch(`${BACKEND_URL}/projects/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });
    if (!response.ok) throw new Error("Failed to delete project");
  },
};