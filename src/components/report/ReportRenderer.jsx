import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function isFinancialProjectionTable(headers) {
  return headers.some(h => /y(ear)?\s*[1-5]|fy\s*20\d\d|yr\s*[1-5]/i.test(h));
}

function isCostTable(headers) {
  return headers.length >= 2 && headers.length <= 4 &&
    /amount|cost|value|total|₹|\$|inr|usd/i.test(headers.join(" "));
}

function isRatioTable(headers) {
  return /ratio|dscr|benchmark|metric/i.test(headers.join(" "));
}

const CHART_COLORS = [
  "#4f46e5", "#059669", "#d97706",
  "#e11d48", "#7c3aed", "#0d9488",
  "#2563eb", "#db2777"
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-bold">{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ── Chart Component ───────────────────────────────────────────────────────────

function FinancialChart({ headers, rows, theme }) {
  if (isFinancialProjectionTable(headers)) {
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

    const priorityKeys = rows
      .map(r => r[0])
      .filter(Boolean)
      .filter(k => /revenue|sales|profit|pat|ebitda|cash/i.test(k))
      .slice(0, 4);

    const keys = priorityKeys.length > 0
      ? priorityKeys
      : rows.map(r => r[0]).filter(Boolean).slice(0, 4);

    return (
      <div className="mb-4 p-4 rounded-2xl border" style={{ borderColor: theme.primary + "25", backgroundColor: theme.light }}>
        <p className="text-xs font-medium text-gray-500 mb-2">📊 Financial Projection Chart</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <defs>
              {keys.map((k, i) => (
                <linearGradient key={k} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              width={65}
              axisLine={false}
              tickLine={false}
              tickFormatter={v =>
                v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr`
                  : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L`
                    : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K`
                      : v
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map((k, i) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={CHART_COLORS[i]}
                strokeWidth={2}
                fill={`url(#grad${i})`}
                dot={{ r: 3, fill: CHART_COLORS[i] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (isCostTable(headers)) {
    const pieData = rows
      .map(r => ({ name: r[0], value: extractNumber(r[1] || r[2]) }))
      .filter(d => d.value !== null && d.value > 0)
      .slice(0, 8);

    if (pieData.length > 1) {
      return (
        <div className="mb-4 p-4 rounded-2xl border" style={{ borderColor: theme.primary + "25", backgroundColor: theme.light }}>
          <p className="text-xs font-medium text-gray-500 mb-2">🥧 Cost / Funding Breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={35}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => Number(v).toLocaleString()} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => value.length > 20 ? value.slice(0, 20) + "…" : value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }

  return null;
}

// ── Styled Table ──────────────────────────────────────────────────────────────

function StyledTable({ headers, rows, theme }) {
  const showRatioBadges = isRatioTable(headers);
  const benchmarkIdx = headers.findIndex(h => /benchmark/i.test(h));

  return (
    <div className="my-6">
      <FinancialChart headers={headers} rows={rows} theme={theme} />
      <div
        className="overflow-x-auto rounded-2xl border shadow-sm"
        style={{ borderColor: theme.primary + "20" }}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: theme.primary }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isBold = /total|net|sub-total|grand|profit|pat|ebitda|cash accrual/i.test(row[0] || "");
              return (
                <tr
                  key={ri}
                  style={{ backgroundColor: ri % 2 === 0 ? "white" : theme.light }}
                  className="hover:brightness-95 transition-all"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 border-b text-sm ${ci === 0 ? "font-medium text-left" : "text-right tabular-nums"
                        } ${isBold ? "font-bold" : ""}`}
                      style={{
                        borderColor: theme.primary + "12",
                        color: ci === 0 ? theme.text : "inherit",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Renderer ─────────────────────────────────────────────────────────────

export default function ReportRenderer({ content, theme }) {
  const components = useMemo(() => ({
    h1: ({ children }) => (
      <h1
        className="font-bold text-2xl mt-10 mb-3 pb-2.5 border-b-2 tracking-tight"
        style={{ color: theme.text, borderColor: theme.primary }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <div className="mt-8 mb-3 flex items-center gap-3">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: theme.primary }} />
        <h2 className="font-bold text-lg" style={{ color: theme.text }}>
          {children}
        </h2>
      </div>
    ),
    h3: ({ children }) => (
      <h3
        className="font-semibold text-base mt-5 mb-2 pl-3 border-l-2"
        style={{ color: theme.text, borderColor: theme.primary + "60" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-semibold text-sm mt-3 mb-1" style={{ color: theme.text }}>
        {children}
      </h4>
    ),
    strong: ({ children }) => (
      <strong style={{ color: theme.text }}>{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-4 pl-4 py-2 pr-4 rounded-r-xl my-4 text-sm italic"
        style={{ borderColor: theme.primary, backgroundColor: theme.light, color: theme.text }}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="my-2 space-y-1.5 pl-0 list-none">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-2 space-y-1.5 pl-5 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="flex gap-2 items-start text-sm leading-relaxed">
        <span
          className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0"
          style={{ backgroundColor: theme.primary }}
        />
        <span>{children}</span>
      </li>
    ),
    p: ({ children }) => (
      <p className="text-sm leading-relaxed my-2 text-foreground/90">{children}</p>
    ),
    hr: () => (
      <hr className="my-6 border-t-2" style={{ borderColor: theme.primary + "20" }} />
    ),
    code: ({ children }) => (
      <code
        className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{ backgroundColor: theme.light, color: theme.text }}
      >
        {children}
      </code>
    ),
    table: ({ node }) => {
      const extractCells = trs =>
        trs.map(tr =>
          (tr.children || [])
            .filter(c => c.tagName === "th" || c.tagName === "td")
            .map(cell => {
              const getText = n => {
                if (typeof n === "string") return n;
                if (n.value) return n.value;
                if (n.children) return n.children.map(getText).join("");
                return "";
              };
              return getText(cell).trim();
            })
        );

      const thead = node.children?.find(c => c.tagName === "thead");
      const tbody = node.children?.find(c => c.tagName === "tbody");
      const theadRows = (thead?.children || []).filter(c => c.tagName === "tr");
      const tbodyRows = (tbody?.children || []).filter(c => c.tagName === "tr");

      const headers = theadRows.length > 0 ? extractCells(theadRows)[0] : [];
      const rows = extractCells(tbodyRows);

      if (headers.length > 0 && rows.length > 0) {
        return <StyledTable headers={headers} rows={rows} theme={theme} />;
      }

      return (
        <div
          className="overflow-x-auto rounded-2xl border shadow-sm my-6"
          style={{ borderColor: theme.primary + "20" }}
        >
          <table className="w-full text-sm border-collapse" />
        </div>
      );
    },
  }), [theme]);

  return (
    <ReactMarkdown
      className="max-w-none"
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content || "No content generated yet."}
    </ReactMarkdown>
  );
}