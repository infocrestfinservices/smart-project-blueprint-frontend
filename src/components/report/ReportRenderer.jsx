import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// Parse a markdown table into { headers, rows }
function parseMarkdownTable(raw) {
  const lines = raw.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const headers = lines[0].split("|").map(h => h.trim()).filter(Boolean);
  const rows = lines.slice(2).map(l =>
    l.split("|").map(c => c.trim()).filter(Boolean)
  ).filter(r => r.length > 0);
  return { headers, rows };
}

// Extract numeric value from a cell string like "₹ 12,50,000" or "25%"
function extractNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Detect if a table looks like it has year columns (Y1, Year 1, FY2025…)
function isFinancialProjectionTable(headers) {
  return headers.some(h => /y(ear)?\s*[1-5]|fy\s*20\d\d|yr\s*[1-5]/i.test(h));
}

// Detect if a table is a cost breakdown (2-col: item + amount)
function isCostTable(headers) {
  return headers.length === 2 || (headers.length === 3 && /amount|cost|value/i.test(headers[1]));
}

const CHART_COLORS = ["#4f46e5", "#059669", "#d97706", "#e11d48", "#7c3aed", "#0d9488"];

function FinancialChart({ table, theme }) {
  const { headers, rows } = table;

  if (isFinancialProjectionTable(headers)) {
    // Multi-series line/bar chart: first col = metric, rest = year values
    const yearHeaders = headers.slice(1);
    const chartData = yearHeaders.map((yr, yi) => {
      const point = { year: yr };
      rows.forEach(row => {
        const key = row[0];
        const val = extractNumber(row[yi + 1]);
        if (key && val !== null) point[key] = val;
      });
      return point;
    });
    const keys = rows.map(r => r[0]).filter(Boolean);

    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} />
          <Tooltip formatter={(v, name) => [Number(v).toLocaleString(), name]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {keys.slice(0, 5).map((k, i) => (
            <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (isCostTable(headers)) {
    // Pie chart for cost/funding breakdown
    const pieData = rows
      .map(r => ({ name: r[0], value: extractNumber(r[1]) }))
      .filter(d => d.value !== null && d.value > 0);

    if (pieData.length > 1) {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={v => Number(v).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  }

  return null;
}

function StyledTable({ table, theme }) {
  const { headers, rows } = table;
  const chart = <FinancialChart table={table} theme={theme} />;

  return (
    <div className="my-5">
      {chart && (
        <div className="mb-3 p-4 rounded-xl border" style={{ borderColor: theme.primary + "30", backgroundColor: theme.light }}>
          {chart}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: theme.primary + "25" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: theme.primary }}>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? "white" : theme.light }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-2.5 border-b text-sm ${ci === 0 ? "font-medium" : "text-right"}`}
                    style={{ borderColor: theme.primary + "15", color: ci === 0 ? theme.text : "inherit" }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportRenderer({ content, theme }) {
  const components = useMemo(() => ({
    h1: ({ children }) => (
      <h1 className="font-heading font-bold text-2xl mt-10 mb-3 pb-2.5 border-b-2" style={{ color: theme.text, borderColor: theme.primary }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <div className="mt-8 mb-3">
        <h2 className="font-heading font-bold text-lg inline-block px-3 py-1 rounded-lg text-white" style={{ backgroundColor: theme.primary }}>
          {children}
        </h2>
      </div>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading font-semibold text-base mt-5 mb-2 flex items-center gap-2" style={{ color: theme.text }}>
        <span className="w-1 h-4 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: theme.primary }} />
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-semibold text-sm mt-3 mb-1" style={{ color: theme.text }}>{children}</h4>
    ),
    strong: ({ children }) => <strong style={{ color: theme.text }}>{children}</strong>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 py-2 pr-4 rounded-r-xl my-4 text-sm italic" style={{ borderColor: theme.primary, backgroundColor: theme.light, color: theme.text }}>
        {children}
      </blockquote>
    ),
    ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-0 list-none">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 space-y-1.5 pl-5 list-decimal">{children}</ol>,
    li: ({ children }) => (
      <li className="flex gap-2 items-start text-sm leading-relaxed">
        <span className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: theme.primary }} />
        <span>{children}</span>
      </li>
    ),
    p: ({ children }) => <p className="text-sm leading-relaxed my-2 text-foreground/90">{children}</p>,
    hr: () => <hr className="my-6 border-t-2" style={{ borderColor: theme.primary + "20" }} />,
    // Tables: custom rendering with charts
    table: ({ node, ...props }) => {
      // Extract raw text to parse table
      const rawLines = [];
      const collectText = (n) => {
        if (!n) return;
        if (typeof n === "string") { rawLines.push(n); return; }
        if (n.type === "element") {
          if (["tr", "th", "td"].includes(n.tagName)) rawLines.push(n.tagName === "tr" ? "\n" : "|");
          (n.children || []).forEach(collectText);
        }
        if (Array.isArray(n)) n.forEach(collectText);
      };
      collectText(node);

      // Reconstruct markdown table from DOM node
      const extractCells = (rows) => {
        return rows.map(tr =>
          (tr.children || [])
            .filter(c => c.tagName === "th" || c.tagName === "td")
            .map(cell => {
              const getText = (n) => {
                if (typeof n === "string") return n;
                if (n.children) return n.children.map(getText).join("");
                return "";
              };
              return getText(cell);
            })
        );
      };

      const thead = node.children?.find(c => c.tagName === "thead");
      const tbody = node.children?.find(c => c.tagName === "tbody");
      const theadRows = (thead?.children || []).filter(c => c.tagName === "tr");
      const tbodyRows = (tbody?.children || []).filter(c => c.tagName === "tr");

      const headers = theadRows.length > 0 ? extractCells(theadRows)[0] : [];
      const rows = extractCells(tbodyRows);

      if (headers.length > 0 && rows.length > 0) {
        return <StyledTable table={{ headers, rows }} theme={theme} />;
      }

      // Fallback
      return (
        <div className="overflow-x-auto my-4 rounded-xl border" style={{ borderColor: theme.primary + "25" }}>
          <table className="w-full text-sm" {...props} />
        </div>
      );
    },
    thead: ({ children }) => <thead style={{ backgroundColor: theme.primary }}>{children}</thead>,
    th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white whitespace-nowrap">{children}</th>,
    td: ({ children, ...props }) => (
      <td className="px-4 py-2.5 border-b text-sm text-right" style={{ borderColor: theme.primary + "15" }} {...props}>
        {children}
      </td>
    ),
    tr: ({ children, ...props }) => <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors" {...props}>{children}</tr>,
  }), [theme]);

  return (
    <ReactMarkdown className="max-w-none" components={components}>
      {content || "No content generated yet."}
    </ReactMarkdown>
  );
}