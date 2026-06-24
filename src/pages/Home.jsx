import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Plus, FileText, Loader2, LogOut, Sparkles, Globe2, BarChart3, Download,
  CheckCircle2, ArrowRight, Zap, Shield, Clock, Star, ChevronRight, Building2,
  TrendingUp, Users, Award, Check, X
} from "lucide-react";
import ReportCard from "@/components/report/ReportCard";

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Interviews", desc: "Conversational AI asks the right questions to extract all project details — no forms to fill.", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Globe2, title: "Country-Specific Formats", desc: "CMA Data for India, SBA format for USA, Innovate UK grants, and more — auto-detected.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BarChart3, title: "Live Financial Charts", desc: "P&L, revenue projections, and cost breakdowns rendered as interactive graphs inside the report.", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Download, title: "Export Everywhere", desc: "Download as polished PDF, formatted Word doc, or editable Excel — ready to submit.", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Shield, title: "Bank & Investor Ready", desc: "DSCR, Current Ratio, IRR, Payback Period, MOIC — every metric lenders and investors need.", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Clock, title: "Minutes, Not Weeks", desc: "What a CA takes 2–3 weeks to prepare, ReportCraft delivers in under 5 minutes.", color: "text-indigo-500", bg: "bg-indigo-50" },
];

const STATS = [
  { value: "10,000+", label: "Reports Generated" },
  { value: "₹2,400 Cr+", label: "Loans Facilitated" },
  { value: "95%", label: "Approval Rate" },
  { value: "4.9 ★", label: "User Rating" },
];

const TESTIMONIALS = [
  { name: "Rajesh Mehta", role: "MSME Owner, Surat", text: "Got my SBI CMA data report in 4 minutes. The DSCR tables were perfect. My loan got approved in the first attempt.", avatar: "RM" },
  { name: "Priya Nair", role: "Startup Founder, Bangalore", text: "The VC-grade financial model with IRR and cap table saved us at least ₹80,000 in CA fees. Investors loved the depth.", avatar: "PN" },
  { name: "Amir Khan", role: "Restaurant Chain, Delhi", text: "Used it for a government PMEGP scheme report. The AI knew exactly what format KVIC requires. Remarkable.", avatar: "AK" },
];

const PLANS = [
  {
    name: "Starter",
    tag: null,
    price: "₹499",
    period: "one-time",
    description: "Perfect for a single loan application or project proposal.",
    color: "border-border",
    headerBg: "bg-muted/40",
    features: [
      { text: "3 Project Reports", included: true },
      { text: "Short & Long Format", included: true },
      { text: "PDF Export", included: true },
      { text: "Word Export", included: false },
      { text: "Excel Financials", included: false },
      { text: "CMA / SBA Formats", included: false },
      { text: "Investor-Grade Metrics", included: false },
    ],
    cta: "Get Started",
    variant: "outline",
  },
  {
    name: "Professional",
    tag: "Most Popular",
    price: "₹1,499",
    period: "/ month",
    description: "For CAs, consultants, and entrepreneurs with ongoing needs.",
    color: "border-primary",
    headerBg: "bg-primary",
    features: [
      { text: "Unlimited Reports", included: true },
      { text: "Short & Long Format", included: true },
      { text: "PDF + Word Export", included: true },
      { text: "Excel Financials Export", included: true },
      { text: "CMA / SBA / UK Grant Formats", included: true },
      { text: "Investor-Grade Metrics (IRR, MOIC)", included: true },
      { text: "Priority AI Generation", included: false },
    ],
    cta: "Start Free Trial",
    variant: "default",
  },
  {
    name: "Enterprise",
    tag: null,
    price: "₹4,999",
    period: "/ month",
    description: "For CA firms, DSAs, and banks processing high volumes.",
    color: "border-border",
    headerBg: "bg-muted/40",
    features: [
      { text: "Unlimited Reports", included: true },
      { text: "All Export Formats", included: true },
      { text: "CMA / SBA / UK / PE / VC Formats", included: true },
      { text: "Investor-Grade Metrics", included: true },
      { text: "Priority AI (Claude Opus)", included: true },
      { text: "Team Members (5 seats)", included: true },
      { text: "White-label & Custom Branding", included: true },
    ],
    cta: "Contact Sales",
    variant: "outline",
  },
];

const ONE_TIME = [
  { name: "Single CMA Report", price: "₹299", desc: "One full CMA-format report for any Indian bank", icon: Building2 },
  { name: "Investor Pitch Pack", price: "₹799", desc: "VC-grade financials + pitch deck summary", icon: TrendingUp },
  { name: "Government Scheme Report", price: "₹199", desc: "PMEGP, Mudra, CGTMSE, or any state scheme", icon: Award },
  { name: "Feasibility Study", price: "₹499", desc: "Technical + financial feasibility with SWOT", icon: BarChart3 },
];

export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    Promise.all([
      reportStorage.list("-created_date", 50)
    ]).then(([r]) => {
      setReports(r);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await reportStorage.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLogout = () => {
    logout("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold">ReportCraft AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Feasibility Studies & Project Reports</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#reports" className="hover:text-foreground transition-colors">My Reports</a>
            <Link to="/dashboard" className="hover:text-foreground transition-colors font-medium text-primary">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.full_name || user.email}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude AI · Trusted by 10,000+ Entrepreneurs
          </div>

          <h2 className="text-4xl sm:text-6xl font-heading font-bold tracking-tight leading-tight">
            Professional Feasibility Studies
            <br />
            <span className="text-primary">& Project Reports in 5 Minutes</span>
          </h2>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
            Tell our AI your business idea. It asks the right questions, understands your country's
            financial format — CMA Data, SBA, SBI, DSCR — and writes a complete, submission-ready
            feasibility study or project report.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/create">
              <Button size="lg" className="h-13 px-8 text-base gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto">
                <Plus className="w-5 h-5" /> Create Free Report
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button variant="outline" size="lg" className="h-13 px-8 text-base gap-2 w-full sm:w-auto">
                View Pricing
              </Button>
            </a>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
            {["✅ No credit card needed", "✅ First report free", "✅ CMA / SBA / VC formats"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Why ReportCraft AI</p>
          <h3 className="text-3xl sm:text-4xl font-heading font-bold">Everything a banker or investor needs</h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From CMA data to VC pitch decks — the right format, every time, for every region.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card rounded-2xl border p-6 hover:shadow-md transition-shadow group">
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h4 className="font-semibold text-base mb-1.5">{f.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Simple Process</p>
          <h3 className="text-3xl sm:text-4xl font-heading font-bold mb-12">Ready in 3 steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Describe your project", desc: "Type your business idea in plain English. The AI understands every industry and region.", icon: Zap },
              { step: "02", title: "AI interviews you", desc: "It asks smart follow-up questions — costs, location, bank format, investor type. One question at a time.", icon: Sparkles },
              { step: "03", title: "Download your report", desc: "Get a fully formatted CMA / SBA / investor-grade report in PDF, Word, or Excel in minutes.", icon: Download },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-xl font-bold font-heading mx-auto mb-4 shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                <h4 className="font-semibold text-lg mb-2">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-5 -right-4 w-6 h-6 text-muted-foreground/40" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Trusted by Entrepreneurs</p>
          <h3 className="text-3xl sm:text-4xl font-heading font-bold">What our users say</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-card border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Pricing</p>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold">Plans for every need</h3>
            <p className="text-muted-foreground mt-3">Start free. Upgrade when you need more. Cancel anytime.</p>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border-2 ${plan.color} overflow-hidden flex flex-col relative ${plan.tag ? "shadow-xl shadow-primary/10" : "shadow-sm"}`}>
                {plan.tag && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                    {plan.tag}
                  </div>
                )}
                <div className={`${plan.headerBg} px-6 py-6`}>
                  {plan.name === "Professional" ? (
                    <>
                      <p className="text-white/80 text-sm font-medium mb-1">{plan.name}</p>
                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-heading font-bold text-white">{plan.price}</span>
                        <span className="text-white/70 text-sm mb-1">{plan.period}</span>
                      </div>
                      <p className="text-white/70 text-xs mt-2">{plan.description}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-sm font-medium mb-1">{plan.name}</p>
                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-heading font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-2">{plan.description}</p>
                    </>
                  )}
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col gap-3 bg-card">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5 text-sm">
                      {f.included
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        : <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      }
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60 line-through"}>{f.text}</span>
                    </div>
                  ))}
                  <Link to="/create" className="mt-4">
                    <Button variant={plan.variant} className="w-full" size="sm">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* One-time purchases */}
          <div>
            <div className="text-center mb-8">
              <h4 className="text-2xl font-heading font-bold">Or pay per report</h4>
              <p className="text-muted-foreground text-sm mt-1">No subscription needed — buy exactly what you need.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ONE_TIME.map((item) => (
                <div key={item.name} className="bg-card border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xl font-heading font-bold text-primary">{item.price}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  <Link to="/create">
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-xs gap-1 group-hover:bg-primary/5">
                      Generate Now <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-primary rounded-3xl px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-violet-600 opacity-90 rounded-3xl" />
          <div className="relative">
            <h3 className="text-3xl font-heading font-bold text-white mb-3">
              Ready to create your feasibility study or project report?
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Join thousands of entrepreneurs who submitted professional CMA reports, feasibility studies, and investor decks — and got funded.
            </p>
            <Link to="/create">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 shadow-xl">
                <Plus className="w-5 h-5" /> Create Your Report Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── My Reports ── */}
      <section id="reports" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold">My Reports</h3>
          <Link to="/create">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Report
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
            <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg">No reports yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Create your first project report to get started</p>
            <Link to="/create">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Create First Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground">ReportCraft AI</span>
            <span>· AI-Powered Project Reports</span>
          </div>
          <p>© 2026 ReportCraft AI. Built for Indian & global entrepreneurs.</p>
        </div>
      </footer>
    </div>
  );
}