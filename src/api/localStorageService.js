/**
 * Local Storage Service — replaces base44.entities.ProjectReport
 * 
 * Stores all report data in localStorage under the key "reportcraft_reports".
 * Each report gets a UUID, created_date, and updated_date.
 */

const STORAGE_KEY = "reportcraft_reports";

function generateId() {
  return crypto.randomUUID();
}

function getAllReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export const reportStorage = {
  /**
   * List reports, optionally sorted and limited.
   * @param {string} sortField - e.g. "-created_date" (prefix "-" for descending)
   * @param {number} limit - max number of results
   * @returns {Promise<Array>}
   */
  async list(sortField = "-created_date", limit = 100) {
    let reports = getAllReports();

    // Parse sort field
    const desc = sortField.startsWith("-");
    const field = desc ? sortField.slice(1) : sortField;

    reports.sort((a, b) => {
      const va = a[field] || "";
      const vb = b[field] || "";
      if (va < vb) return desc ? 1 : -1;
      if (va > vb) return desc ? -1 : 1;
      return 0;
    });

    return reports.slice(0, limit);
  },

  /**
   * Get a single report by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    const reports = getAllReports();
    const report = reports.find((r) => r.id === id);
    if (!report) throw new Error("Report not found");
    return report;
  },

  /**
   * Create a new report.
   * @param {Object} data
   * @returns {Promise<Object>} The created report with id, created_date, updated_date
   */
  async create(data) {
    const reports = getAllReports();
    const now = new Date().toISOString();
    const newReport = {
      ...data,
      id: generateId(),
      created_date: now,
      updated_date: now,
    };
    reports.push(newReport);
    saveAllReports(reports);
    return newReport;
  },

  /**
   * Update an existing report by ID.
   * @param {string} id
   * @param {Object} fields - partial fields to update
   * @returns {Promise<Object>} The updated report
   */
  async update(id, fields) {
    const reports = getAllReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Report not found");

    reports[index] = {
      ...reports[index],
      ...fields,
      updated_date: new Date().toISOString(),
    };
    saveAllReports(reports);
    return reports[index];
  },

  /**
   * Delete a report by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const reports = getAllReports().filter((r) => r.id !== id);
    saveAllReports(reports);
  },
};
