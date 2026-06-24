import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { invokeLLM } from "@/api/llmService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, FileText, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TemplateSelector from "@/components/report/TemplateSelector";

const SYSTEM_PROMPT = `You are a friendly project report assistant. Your job is to gather information from the user to create a professional project report.

CONVERSATION FLOW:
1. When the user describes their business idea, extract what you can and ask ONE follow-up question at a time.
2. You MUST gather these details conversationally (ask only what you don't know yet):
   - Project/business title and description
   - Country and city/location
   - Industry/sector
   - Promoter/company name and their experience
   - Target market and customers
   - Total project cost (and currency)
   - Own contribution vs loan/funding required
   - Purpose: bank loan, feasibility study, government scheme (which one?), investor fundraising, or internal planning
   - Report format preference: short (2-3 pages) or long (10-15 pages)
   - Financial projection format (see rules below)
3. Ask ONE clear, friendly question at a time. Keep it conversational.

FINANCIAL FORMAT QUESTION (ask after purpose is known):
- If purpose is "bank_loan" AND country is India → ask: "Do you need **CMA (Credit Monitoring Arrangement) data** format as required by Indian banks? If yes, which bank — SBI, PNB, Canara, or others? This includes DSCR, Current Ratio, TOL/TNW, and Fund Flow Statement."
- If purpose is "bank_loan" AND country is USA → ask: "Is this for an **SBA loan** (SBA 7a/504)? SBA requires specific cash flow analysis, debt schedule, and global cash flow statement."
- If purpose is "bank_loan" AND country is UK → ask: "Is this for a specific bank product — e.g. **British Business Bank / Innovate UK Innovation Grant / CBILS**? Each has specific financial requirements."
- If purpose is "bank_loan" AND country is other → ask: "Do you need the financials in any specific bank format, or standard format is fine?"
- If purpose is "investor_fundraising" → ask: "What investor grade format do you need — **VC/Angel pitch** (IRR, NPV, payback period, cap table), **PE/Growth equity** (EBITDA multiples, exit valuation), or **Standard investor deck**?"
- If purpose is "government_scheme" → already have scheme name, no extra question needed.
- If purpose is "feasibility_study" or "internal_planning" → set financial_format to "standard", skip this question.

4. Once you have ALL required information including financial format, respond with ONLY a JSON block (no other text):

\`\`\`json
{
  "ready": true,
  "data": {
    "title": "...",
    "industry": "...",
    "sub_industry": "...",
    "country": "...",
    "currency": "...",
    "location": "...",
    "promoter_name": "...",
    "promoter_experience": "...",
    "project_description": "...",
    "target_market": "...",
    "target_customers": "...",
    "project_cost": 0,
    "own_contribution": 0,
    "loan_amount": 0,
    "purpose": "bank_loan|feasibility_study|government_scheme|investor_fundraising|internal_planning",
    "government_scheme_name": "...",
    "report_format": "short|long",
    "financial_format": "cma_india|sba_usa|innovate_uk|investor_vc|investor_pe|investor_standard|standard",
    "financial_format_detail": "e.g. SBI CMA, SBA 7a, Innovate UK, Series A VC, etc."
  }
}
\`\`\`

IMPORTANT RULES:
- Never ask more than one question per message
- Be warm and professional
- If user gives vague costs (e.g. "around 50 lakhs"), use the number (5000000 for INR)
- Infer currency from country (India→INR, US→USD, etc.)
- If format not specified, ask: "Would you like a Short format (2-3 pages, quick overview) or Long format (10-15 pages, comprehensive)?"
- If purpose not specified, ask about it
- Keep questions short and direct`;

function buildFinancialFormatInstructions(data, curr) {
  const fmt = data.financial_format || "standard";
  const detail = data.financial_format_detail || "";

  if (fmt === "cma_india") {
    return `FINANCIAL FORMAT: CMA DATA (Credit Monitoring Arrangement) — Standard Indian Bank Format${detail ? ` for ${detail}` : ""}

Generate ALL of the following CMA Forms as numbered markdown tables, EXACTLY in the structure used by SBI/PNB/Canara Bank RAM tool. All amounts in INR Lakhs (or Crores if large). Columns = 2 Audited years + 1 Estimated year + 5 Projected years (Year 1–5).

---

## CMA FORM I — Cost of Project & Means of Finance

**Table A: Cost of Project**
| Sr. No. | Particulars | Amount (₹ Lakhs) | % of Total |
(Include: Land & Development, Building, Furniture & Fixtures, Electrical Equipments, Plant & Machinery, Pre-operative Expenses, Contingencies, Working Capital Margin, Interest During Construction)

**Table B: Means of Finance**
| Particulars | Amount (₹ Lakhs) | % of Total |
(Include: Promoter's Own Contribution/Corpus Fund, Term Loan – Bank (TL-1, TL-2), Working Capital Loan)
Show: Debt-Equity Ratio, Promoter Contribution %

---

## CMA FORM II — Operating Statement (P&L Account)
(All figures in ₹ Lakhs. Columns: Audited Y-2 | Audited Y-1 | Estimated Y0 | Projected Y1 | Y2 | Y3 | Y4 | Y5)

| Sr. | Particulars | Y-2 (Aud) | Y-1 (Aud) | Y0 (Est) | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Gross Domestic Sales | | | | | | | | |
| 2 | Gross Export Sales | | | | | | | | |
| 3 | Total Gross Sales | | | | | | | | |
| 4 | Less: Excise Duty / GST | | | | | | | | |
| 5 | Net Sales | | | | | | | | |
| 6 | Net Sales Growth Rate (%) | | | | | | | | |
| 7 | Other Operating Income | | | | | | | | |
| 8 | Total Operating Income | | | | | | | | |
| | **Cost of Sales** | | | | | | | | |
| 9 | Raw Materials Consumed (Indigenous) | | | | | | | | |
| 10 | Raw Materials Consumed (Imported) | | | | | | | | |
| 11 | Power & Fuel | | | | | | | | |
| 12 | Direct Labour / Employee Cost | | | | | | | | |
| 13 | Other Operating Expenses | | | | | | | | |
| 14 | Depreciation | | | | | | | | |
| 15 | Sub-Total (Cost of Production) | | | | | | | | |
| 16 | Add: Opening Stock of WIP | | | | | | | | |
| 17 | Less: Closing Stock of WIP | | | | | | | | |
| 18 | **Cost of Production** | | | | | | | | |
| 19 | Add: Opening Stock of Finished Goods | | | | | | | | |
| 20 | Less: Closing Stock of Finished Goods | | | | | | | | |
| 21 | **Cost of Goods Sold** | | | | | | | | |
| 22 | Selling & Distribution Expenses | | | | | | | | |
| 23 | General & Administration Expenses | | | | | | | | |
| 24 | **Total Operating Cost** | | | | | | | | |
| 25 | **Operating Profit (EBITDA)** | | | | | | | | |
| 26 | Interest on Term Loans | | | | | | | | |
| 27 | Interest on Working Capital | | | | | | | | |
| 28 | Bank Charges | | | | | | | | |
| 29 | **Total Interest & Finance Charges** | | | | | | | | |
| 30 | **Operating Profit after Interest (EBIT)** | | | | | | | | |
| 31 | Add: Non-Operating Income | | | | | | | | |
| 32 | Less: Non-Operating Expenses | | | | | | | | |
| 33 | **Profit Before Tax (PBT)** | | | | | | | | |
| 34 | Less: Provision for Income Tax | | | | | | | | |
| 35 | **Profit After Tax (PAT)** | | | | | | | | |
| 36 | Add: Depreciation | | | | | | | | |
| 37 | **Cash Accruals (PAT + Depreciation)** | | | | | | | | |
| 38 | PBDIT (Profit Before Dep, Int & Tax) | | | | | | | | |
| 39 | PBDIT Margin (%) | | | | | | | | |
| 40 | PAT Margin (%) | | | | | | | | |

---

## CMA FORM III — Balance Sheet
(All figures in ₹ Lakhs. Same year columns as Form II)

**LIABILITIES SIDE**
| Sr. | Particulars | Y-2 | Y-1 | Y0 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| | **A. CURRENT LIABILITIES** | | | | | | | | |
| 1 | Short-Term Borrowings from Banks (CC/OD) | | | | | | | | |
| 2 | Creditors for Purchases (Trade Payables) | | | | | | | | |
| 3 | Advance Payments from Customers | | | | | | | | |
| 4 | Provisions (Tax, Others) | | | | | | | | |
| 5 | Other Current Liabilities | | | | | | | | |
| 6 | **Sub-Total: Current Liabilities (A)** | | | | | | | | |
| | **B. TERM LIABILITIES** | | | | | | | | |
| 7 | Term Loan – Bank (TL-1) | | | | | | | | |
| 8 | Term Loan – Bank (TL-2) | | | | | | | | |
| 9 | Other Term Liabilities | | | | | | | | |
| 10 | **Sub-Total: Term Liabilities (B)** | | | | | | | | |
| 11 | **Total Outside Liabilities (A+B)** | | | | | | | | |
| | **C. NET WORTH** | | | | | | | | |
| 12 | Share Capital / Partners' Capital / Corpus Fund | | | | | | | | |
| 13 | General Reserves | | | | | | | | |
| 14 | Retained Profit / P&L Balance | | | | | | | | |
| 15 | **Net Worth (C)** | | | | | | | | |
| 16 | **TOTAL LIABILITIES (A+B+C)** | | | | | | | | |

**ASSETS SIDE**
| Sr. | Particulars | Y-2 | Y-1 | Y0 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| | **D. CURRENT ASSETS** | | | | | | | | |
| 17 | Cash & Bank Balances | | | | | | | | |
| 18 | Domestic Receivables (Debtors ≤180 days) | | | | | | | | |
| 19 | Inventory (Raw Material + WIP + Finished Goods) | | | | | | | | |
| 20 | Advances to Suppliers | | | | | | | | |
| 21 | Other Current Assets | | | | | | | | |
| 22 | **Total Current Assets (D)** | | | | | | | | |
| | **E. FIXED ASSETS** | | | | | | | | |
| 23 | Gross Block | | | | | | | | |
| 24 | Less: Accumulated Depreciation | | | | | | | | |
| 25 | **Net Block (E)** | | | | | | | | |
| 26 | Capital Work-in-Progress | | | | | | | | |
| | **F. NON-CURRENT ASSETS** | | | | | | | | |
| 27 | Investments / Deposits / Other Non-Current Assets | | | | | | | | |
| 28 | **TOTAL ASSETS (D+E+F)** | | | | | | | | |
| | **Key Balance Sheet Metrics** | | | | | | | | |
| 29 | **Tangible Net Worth (TNW)** | | | | | | | | |
| 30 | **Net Working Capital (NWC = D - A)** | | | | | | | | |
| 31 | Current Ratio (D/A) | | | | | | | | |
| 32 | Quick Ratio | | | | | | | | |
| 33 | TOL/TNW | | | | | | | | |
| 34 | Debt-Equity Ratio (TL / Net Worth) | | | | | | | | |

---

## CMA FORM IV — Comparative Statement of Current Assets & Liabilities (MPBF — Working Capital Assessment)
(Tandon Committee Method II)

| Sl. | Particulars | Y0 (Est) | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|
| 1 | Total Current Assets (TCA) | | | | | | |
| 2 | Other Current Liabilities (OCL) excl. Bank Borrowings | | | | | | |
| 3 | Working Capital Gap (1 - 2) | | | | | | |
| 4 | Min. Stipulated NWC (25% of TCA — Method II) | | | | | | |
| 5 | Actual / Projected NWC | | | | | | |
| 6 | MPBF (Lower of: WC Gap - Min NWC OR WC Gap - Actual NWC) | | | | | | |
| 7 | Existing/Sanctioned Working Capital Limit | | | | | | |
| 8 | **Recommended Working Capital Limit** | | | | | | |

---

## CMA FORM V — Fund Flow Statement
(Sources and Uses of Funds — ₹ Lakhs)

| Particulars | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| **SOURCES OF FUNDS** | | | | | |
| PAT | | | | | |
| Depreciation | | | | | |
| Increase in Term Liabilities | | | | | |
| Increase in Capital / Corpus Fund | | | | | |
| **Total Sources** | | | | | |
| **USES OF FUNDS** | | | | | |
| Capital Expenditure (Fixed Assets) | | | | | |
| Repayment of Term Loans | | | | | |
| Increase in Net Working Capital | | | | | |
| Dividend / Withdrawals | | | | | |
| **Total Uses** | | | | | |
| **Surplus / Deficit** | | | | | |
| Opening Cash Balance | | | | | |
| **Closing Cash Balance** | | | | | |

---

## CMA FORM VI — Cash Flow Statement (Indirect Method)
(₹ Lakhs)

| Particulars | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| **A. Operating Activities** | | | | | |
| Net Profit Before Tax | | | | | |
| Add: Depreciation | | | | | |
| Add: Interest Paid | | | | | |
| Operating Profit before WC changes | | | | | |
| (Inc.) / Dec. in Current Assets | | | | | |
| Inc. / (Dec.) in Current Liabilities | | | | | |
| Less: Income Tax Paid | | | | | |
| **Net Cash from Operating Activities** | | | | | |
| **B. Investing Activities** | | | | | |
| Purchase of Fixed Assets | | | | | |
| **Net Cash from Investing Activities** | | | | | |
| **C. Financing Activities** | | | | | |
| Proceeds from Term Loans | | | | | |
| Repayment of Term Loans | | | | | |
| Interest Paid | | | | | |
| Inc. / (Dec.) in Working Capital Borrowings | | | | | |
| **Net Cash from Financing Activities** | | | | | |
| **Net Inc. / (Dec.) in Cash (A+B+C)** | | | | | |
| Opening Cash Balance | | | | | |
| **Closing Cash Balance** | | | | | |

---

## Loan Repayment Schedule — Term Loan(s)
(₹ Lakhs)

| Year | Opening Balance | Principal Repayment | Interest @ __% | Total Outflow | Closing Balance | DSCR |
|---|---|---|---|---|---|---|
| Y1 | | | | | | |
| Y2 | | | | | | |
| Y3 | | | | | | |
| Y4 | | | | | | |
| Y5 | | | | | | |
| Y6 | | | | | | |
| Y7 | | | | | | |
| Y8 | | | | | | |
| **Average DSCR** | | | | | | |

DSCR = (PAT + Depreciation + Interest on TL) / (Principal Repayment + Interest on TL). Average DSCR must be ≥ 1.50.

---

## Key Financial Ratios Summary

| Ratio | Benchmark | Y1 | Y2 | Y3 | Y4 | Y5 | Avg |
|---|---|---|---|---|---|---|---|
| DSCR | ≥ 1.50 | | | | | | |
| Current Ratio | ≥ 1.33 | | | | | | |
| Quick Ratio | ≥ 1.00 | | | | | | |
| TOL/TNW | ≤ 3.00 | | | | | | |
| Debt-Equity Ratio | ≤ 2.00 | | | | | | |
| Interest Coverage Ratio | ≥ 1.50 | | | | | | |
| PBDIT Margin (%) | — | | | | | | |
| PAT Margin (%) | — | | | | | | |
| Net Sales Growth (%) | — | | | | | | |
| Break-Even Point (% capacity) | — | | | | | | |

---

RULES:
- All amounts in ₹ Lakhs. If values > 100 Lakhs, show in Crores too as a note.
- Use Indian banking terminology throughout: "CC Limit", "MPBF", "NWC", "NOCF", "TOL/TNW", "Tangible Net Worth", "Cash Accruals".
- All numbers must be internally consistent across all Forms (Balance Sheet must balance: Total Assets = Total Liabilities + Net Worth).
- DSCR calculation must use the exact formula: (PAT + Dep + Interest on TL) / (Principal + Interest on TL).
- Highlight cells where ratios breach bank benchmarks with a note "(Below Benchmark)".`;
  }

  if (fmt === "sba_usa") {
    return `FINANCIAL FORMAT: SBA Loan Format (USA)${detail ? ` — ${detail}` : ""}
MANDATORY SBA-SPECIFIC SECTIONS & TABLES:
1. **SBA Personal Financial Statement Summary** (net worth, assets, liabilities of promoter).
2. **Global Cash Flow Analysis**: Business cash flow + personal cash flow of owners; must demonstrate ability to service all debt.
3. **Debt Schedule Table**: All existing debts — Creditor | Original Amount | Balance | Monthly Payment | Maturity | Collateral.
4. **SBA Loan Repayment Projection**: Year | Revenue | EBITDA | Debt Service | DSCR | Excess Cash Flow.
5. **Use of Proceeds Table**: columns = Purpose | SBA Loan Amount | Equity Injection | Total.
6. **3-Year Financial Projections** (minimum) with monthly Year 1 cash flow.
7. **Key SBA Ratios**:
   - Debt Service Coverage Ratio (DSCR ≥ 1.25)
   - Debt-to-Worth Ratio (≤ 4:1 preferred)
   - Working Capital
   - Current Ratio
8. **Collateral Summary Table**: Asset | Current Value | Liens | Net Value.
9. Use US GAAP terminology. Reference SBA SOP 50 10 standards. Mention SBA guarantee fee, loan maturity (10 years equipment, 25 years real estate, 7 years working capital).`;
  }

  if (fmt === "innovate_uk") {
    return `FINANCIAL FORMAT: UK Innovate UK / British Business Bank Grant Format${detail ? ` — ${detail}` : ""}
MANDATORY UK-SPECIFIC SECTIONS & TABLES:
1. **Innovation & Impact Statement**: TRL (Technology Readiness Level), innovation merit, economic impact for UK.
2. **Project Cost Breakdown Table** (required by Innovate UK): Work Package | Activity | Staff Cost (£) | Equipment (£) | Subcontract (£) | Travel (£) | Other (£) | Total (£) | Grant % | Grant Amount (£).
3. **Match Funding Evidence**: Own contribution breakdown, confirmed match funding sources.
4. **Financial Viability Table** (3 years): Revenue, EBITDA, Net Profit, Cash Position — must demonstrate business viability.
5. **Key Financial Ratios**:
   - Current Ratio (≥ 1.0)
   - Quick Ratio
   - Gearing Ratio (Debt/Equity)
   - Interest Cover
   - Net Profit Margin
6. **IP (Intellectual Property) Plan**: IP generated, ownership, exploitation route.
7. **Additionality Statement**: Why grant is needed, what wouldn't happen without it.
8. **Jobs Created / Safeguarded Table**: Role | Year 1 | Year 2 | Year 3 | Salary Band.
9. Use UK terminology: "Grant Funding", "Match Funding", "De minimis Aid", "Eligible Costs", "Indirect Costs (overheads at 20% flat rate)", GBP (£). Reference Innovate UK Smart Grant or SBRI as applicable.`;
  }

  if (fmt === "investor_vc") {
    return `FINANCIAL FORMAT: VC / Angel Investor Grade — Startup Financial Projections
MANDATORY INVESTOR-GRADE SECTIONS & TABLES:
1. **Unit Economics Table**: CAC (Customer Acquisition Cost), LTV (Lifetime Value), LTV:CAC Ratio, Payback Period (months), Gross Margin %, Churn Rate.
2. **Revenue Model & MRR/ARR Projections** (for SaaS/subscription) or GMV projections (for marketplace): Month-by-month Year 1, then annual Year 1–5.
3. **Use of Funds Table**: Category | Amount (${curr}) | % | Runway Months.
4. **Funding Milestones Table**: Milestone | Target Date | KPI/Metric | Amount Needed.
5. **Cap Table (illustrative)**: Founder | Investor Round | % Post-Money.
6. **Valuation Basis**: Pre-money valuation, revenue multiple or comparable transactions.
7. **Key Investor Metrics**:
   - IRR (Internal Rate of Return) — target ≥ 25% for VC
   - NPV (Net Present Value) at 15% discount rate
   - Payback Period (years)
   - ROI (Return on Investment) at Year 3 and Year 5
   - Exit Valuation (5x–10x revenue multiple or EBITDA multiple)
8. **Scenario Analysis Table**: Conservative | Base | Optimistic — Revenue, EBITDA, Valuation for Year 3 and Year 5.
9. **Burn Rate & Runway Table**: Monthly Burn | Cash Balance | Runway (months) for 24 months.
10. Use startup/VC terminology: "ARR", "MRR", "Runway", "Burn Rate", "Pre-money / Post-money", "Series A/B", "Term Sheet", "SAFE Note", "Convertible Note".`;
  }

  if (fmt === "investor_pe") {
    return `FINANCIAL FORMAT: Private Equity / Growth Equity Investor Grade
MANDATORY PE-GRADE SECTIONS & TABLES:
1. **EBITDA Bridge Table**: Year 1–5 EBITDA with margin expansion story.
2. **LBO / Acquisition Metrics** (if applicable): Entry Multiple, Exit Multiple, Equity Return, IRR.
3. **Comparable Transactions / Trading Comps Table**: Company | Revenue | EBITDA | EV/EBITDA | EV/Revenue.
4. **Returns Analysis Table**: Entry Equity | Exit Year | MOIC (Multiple of Invested Capital) | IRR | Cash-on-Cash Return.
5. **Debt Capacity Analysis**: Maximum leverage, EBITDA/Interest Cover, Net Debt/EBITDA.
6. **Working Capital Analysis**: DSO, DPO, DIO, Cash Conversion Cycle.
7. **Sensitivity / Scenario Table**: Base, Upside, Downside — Revenue growth, EBITDA margin, Exit multiple, IRR.
8. **Key PE Metrics**:
   - EV/EBITDA multiple
   - EV/Revenue multiple
   - IRR (target ≥ 20%)
   - MOIC (target ≥ 2.5x)
   - Payback Period
   - Net Debt / EBITDA
9. Use PE terminology: "EBITDA", "EV (Enterprise Value)", "LBO", "MOIC", "IRR", "Add-on acquisitions", "Platform company", "Management buyout".`;
  }

  // Standard / default
  return `PURPOSE-SPECIFIC REQUIREMENTS:
${data.purpose === "bank_loan" ? `- Emphasize repayment capacity, DSCR (show year-wise, avg ≥ 1.5), Current Ratio, collateral, debt-equity ratio.
- Include Loan Repayment Schedule table: Year | Opening Balance | Principal | Interest | Total Outflow | Closing Balance | DSCR.` : ""}
${data.purpose === "investor_fundraising" ? "- Emphasize market opportunity, scalability, ROI, IRR, payback period, exit strategy, use of funds, and growth projections." : ""}
${data.purpose === "government_scheme" ? `- Emphasize employment generation, social impact, subsidy utilization, eligibility compliance${data.government_scheme_name ? `, and specific requirements for ${data.government_scheme_name}` : ""}.` : ""}
${data.purpose === "feasibility_study" ? "- Emphasize technical & market feasibility, SWOT analysis, risk assessment, sensitivity analysis, and go/no-go recommendation." : ""}`;
}

export default function CreateReport() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [collectedData, setCollectedData] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessages([{
      role: "assistant",
      content: `Great choice! 🎯 You've selected the **${template.label}** template.\n\nTell me about your ${template.label.toLowerCase()} project and I'll create a tailored report.\n\nFor example: *"${template.examples[0]}"* or *"${template.examples[1]}"*`
    }]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isThinking || isGenerating) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      // Build conversation history for LLM
      const conversationHistory = newMessages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");

      const templateContext = selectedTemplate
        ? `\nTEMPLATE CONTEXT: ${selectedTemplate.contextHint}\n`
        : "";

      const response = await invokeLLM({
        prompt: `${SYSTEM_PROMPT}${templateContext}\n\n---CONVERSATION SO FAR---\n${conversationHistory}\n\nAssistant:`,
        model: "claude_sonnet_4_6"
      });

      // Check if response contains the ready JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.ready && parsed.data) {
            setCollectedData(parsed.data);
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "✅ I have all the information I need! Let me generate your professional project report now...",
              isReady: true
            }]);
            setIsThinking(false);
            // Auto-generate
            generateReport(parsed.data);
            return;
          }
        } catch {}
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an issue. Could you try again?"
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const GENERATION_STEPS = [
    "Analyzing project details...",
    "Researching industry & market data...",
    "Drafting business narrative sections...",
    "Calculating financial projections...",
    "Building P&L, cash flow & ratio tables...",
    "Compiling & finalizing report...",
  ];

  const generateReport = async (data) => {
    setIsGenerating(true);
    setGeneratingStep(0);
    try {
      const purposeLabels = {
        bank_loan: "Bank Loan / Term Loan",
        feasibility_study: "Feasibility Study",
        government_scheme: "Government Scheme / Grant",
        investor_fundraising: "Investor Fundraising",
        internal_planning: "Internal Business Planning"
      };
      const purposeLabel = purposeLabels[data.purpose] || data.purpose;
      const isLong = data.report_format === "long";
      const curr = data.currency || "USD";

      const templateSections = selectedTemplate
        ? (isLong ? selectedTemplate.extraSections.long : selectedTemplate.extraSections.short)
        : [];
      const templateNote = selectedTemplate && templateSections.length > 0
        ? `\nINDUSTRY-SPECIFIC SECTIONS TO INCLUDE: ${templateSections.join(", ")}\n${selectedTemplate.contextHint}`
        : "";

      const financialFormatInstructions = buildFinancialFormatInstructions(data, curr);

      // Shared project context block reused in both prompts
      const projectContext = `**Project Title:** ${data.title}
**Industry:** ${data.industry}${data.sub_industry ? ` — ${data.sub_industry}` : ""}
**Country:** ${data.country} | **Currency:** ${curr}
**Location:** ${data.location || "Not specified"}
**Promoter/Company:** ${data.promoter_name || "Not specified"}
**Experience:** ${data.promoter_experience || "Not specified"}
**Description:** ${data.project_description}
**Target Market:** ${data.target_market}
**Target Customers:** ${data.target_customers}
**Total Project Cost:** ${curr} ${data.project_cost?.toLocaleString()}
**Own Contribution:** ${curr} ${data.own_contribution?.toLocaleString()}
**Loan/Funding Required:** ${curr} ${data.loan_amount?.toLocaleString()}
**Purpose:** ${purposeLabel}
${data.government_scheme_name ? `**Government Scheme:** ${data.government_scheme_name}` : ""}
${data.financial_format_detail ? `**Financial Format:** ${data.financial_format_detail}` : ""}`;

      const formattingRules = `FORMATTING RULES:
- Use ${curr} for all financial figures. Use terminology appropriate for ${data.country}.
- ALL financial data in markdown tables — never prose.
- Use ## for section headings, ### for sub-sections.
- Numbers must be internally consistent and realistic. No filler text.`;

      let reportContent;
      setGeneratingStep(1);

      if (!isLong) {
        setGeneratingStep(2);
        // Short report: single fast call with gemini flash
        const prompt = `You are an expert project report writer. Generate a concise short-format executive summary (2-3 pages):${templateNote}

${projectContext}

${financialFormatInstructions}

SECTIONS (concise but complete):
1. Executive Summary
2. Project Overview
3. Promoter Profile
4. Market Opportunity
5. Project Cost & Funding (table: Sr. No. | Particulars | Amount (${curr}) | % of Total)
6. Revenue & Profitability Summary (3-year P&L table)
7. Key Strengths & Risk Factors
8. Conclusion

${formattingRules}`;

        setGeneratingStep(4);
        reportContent = await invokeLLM({ prompt, model: "claude_sonnet_4_6" });

      } else {
        setGeneratingStep(2);
        // Long report: split into 2 parallel calls, then merge
        const narrativePrompt = `You are an expert project report writer. Write ONLY the narrative sections of a comprehensive project report (no financial tables yet):${templateNote}

${projectContext}

WRITE ONLY THESE SECTIONS (detailed prose + analysis):
## 1. Executive Summary
## 2. Company / Promoter Profile
## 3. Project Overview & Concept
## 4. Industry & Market Analysis
## 5. Products / Services Description
## 6. Target Market & Customer Segmentation
## 7. Marketing & Sales Strategy
## 8. Operations Plan
## 9. Technology & Infrastructure
## 10. Organizational Structure & Manpower
## 16. SWOT Analysis
## 17. Risk Assessment & Mitigation
## 18. Implementation Timeline
## 19. Social & Environmental Impact
## 20. Conclusion & Recommendations

${formattingRules}
- Do NOT include any financial tables or projections — those will be added separately.`;

        const isCmaOrStructured = ["cma_india", "investor_vc", "investor_pe"].includes(data.financial_format || "standard");

        const financialPrompt = isCmaOrStructured
          ? `You are an expert financial analyst. Generate the complete financial model for this project:

${projectContext}

${financialFormatInstructions}

Fill in all tables with realistic, internally consistent numbers appropriate for ${data.country} and the project described above. All amounts in ${curr}.`
          : `You are an expert financial analyst. Write ONLY the financial sections of a project report:

${projectContext}

${financialFormatInstructions}

WRITE ONLY THESE SECTIONS (all numbers in markdown tables):
## 11. Project Cost & Means of Finance
Table: Sr. No. | Particulars | Amount (${curr}) | % of Total

## 12. Revenue Projections (Year 1–5)
Table: Revenue streams as rows, Year 1–5 as columns.

## 13. Projected Profit & Loss Statement (Year 1–5)
Table rows: Revenue, COGS, Gross Profit, Operating Expenses, EBITDA, Depreciation, EBIT, Interest, PBT, Tax, PAT. Columns: Year 1–5.

## 14. Break-Even Analysis
Table: Fixed Costs | Variable Cost % | Break-Even Revenue | Break-Even Units

## 15. Cash Flow Statement (Year 1–5)
Table: Operating, Investing, Financing cash flows by year.

${data.purpose === "bank_loan" ? `## Loan Repayment Schedule
Table: Year | Opening Balance | Principal | Interest | Total Outflow | Closing Balance | DSCR

## Key Financial Ratios (Year 1–5)
Table: DSCR | Current Ratio | Debt-Equity Ratio | ICR | Net Profit Margin %` : ""}

${formattingRules}
- ALL data must be in markdown tables.
- Make numbers realistic, internally consistent, and appropriate for ${data.country}.`;

        setGeneratingStep(3);
        // Run both in parallel
        const [narrativePart, financialPart] = await Promise.all([
          invokeLLM({ prompt: narrativePrompt, model: "claude_sonnet_4_6" }),
          invokeLLM({ prompt: financialPrompt, model: "claude_sonnet_4_6" }),
        ]);

        setGeneratingStep(5);
        // Merge: insert financial sections after section 10 (before SWOT)
        const splitMarker = "## 16.";
        const splitIdx = narrativePart.indexOf(splitMarker);
        if (splitIdx !== -1) {
          reportContent = narrativePart.slice(0, splitIdx) + "\n\n" + financialPart + "\n\n" + narrativePart.slice(splitIdx);
        } else {
          // Fallback: just concatenate
          reportContent = narrativePart + "\n\n" + financialPart;
        }
      }

      const saved = await reportStorage.create({
        title: data.title,
        industry: data.industry,
        sub_industry: data.sub_industry,
        country: data.country,
        currency: data.currency,
        location: data.location,
        promoter_name: data.promoter_name,
        promoter_experience: data.promoter_experience,
        project_description: data.project_description,
        target_market: data.target_market,
        target_customers: data.target_customers,
        project_cost: data.project_cost,
        own_contribution: data.own_contribution,
        loan_amount: data.loan_amount,
        purpose: data.purpose,
        government_scheme_name: data.government_scheme_name,
        report_format: data.report_format,
        report_content: reportContent,
        status: "completed"
      });

      navigate(`/report/${saved.id}`);
    } catch (err) {
      setIsGenerating(false);
      console.error("Report generation error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Report generation failed: ${err?.message || "Unknown error"}. Please try again.`
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm font-semibold">New Report</p>
          </div>
        </header>
        <TemplateSelector onSelect={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Report Assistant</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>{selectedTemplate.icon}</span>
                <span>{selectedTemplate.label} Template</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedTemplate(null); setMessages([]); }}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Change
          </button>
          {isGenerating && (
            <div className="ml-auto flex items-center gap-2 text-xs text-primary font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating report...
            </div>
          )}
        </div>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
                  ${msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border rounded-tl-sm"
                  }
                  ${msg.isReady ? "border-primary/30 bg-accent" : ""}
                `}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-accent border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-4 text-sm flex flex-col gap-3 min-w-[280px] max-w-[380px]">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>{GENERATION_STEPS[generatingStep]}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${Math.round(((generatingStep + 1) / GENERATION_STEPS.length) * 100)}%` }}
                  />
                </div>
                {/* Step dots */}
                <div className="flex gap-1.5 flex-wrap">
                  {GENERATION_STEPS.map((step, i) => (
                    <div
                      key={i}
                      title={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i < generatingStep ? "bg-primary" : i === generatingStep ? "bg-primary/60 animate-pulse" : "bg-primary/15"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Step {generatingStep + 1} of {GENERATION_STEPS.length} · Usually ready in 20–30 sec</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your business idea or answer the question above..."
            className="resize-none min-h-[44px] max-h-32 text-sm"
            rows={1}
            disabled={isThinking || isGenerating}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isThinking || isGenerating}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}