import React, {
  useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback, forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowLeft, List, LayoutGrid,
  Moon, Sun, BookOpen, X, Bookmark, BookmarkCheck, FileText, FileSpreadsheet, Loader2,
} from "lucide-react";
import ReportRenderer from "@/components/report/ReportRenderer";
import { parseReport, packPages } from "@/lib/paginateReport";
import { downloadWord, downloadExcel } from "@/api/generationService";

// ── Page geometry (logical px; the book is scaled to fit via size="stretch") ──
const PAGE_W = 560;
const PAGE_H = 792;
const PAD_X = 52;
const PAD_Y = 54;
const HEADER_H = 34;
const FOOTER_H = 30;
const CONTENT_W = PAGE_W - PAD_X * 2;
const BUDGET = PAGE_H - PAD_Y * 2 - HEADER_H - FOOTER_H;
const TITLE_H = 112;

// ── Palettes ──────────────────────────────────────────────────────────────
const PALETTES = {
  light: {
    pageBg: "#fbf8f1",            // soft ivory
    pageEdge: "#efe9dc",
    ink: "#1f2937",
    faint: "#9ca3af",
    navy: "#10254a",
    gold: "#b08d3f",
    render: { primary: "#10254a", light: "#f3eee2", text: "#10254a" },
  },
  dark: {
    pageBg: "#1c2230",
    pageEdge: "#141926",
    ink: "#e7e9ee",
    faint: "#8a91a3",
    navy: "#cdd6ea",
    gold: "#d8b25e",
    render: { primary: "#9db4e6", light: "#232b3d", text: "#dfe5f2" },
  },
};

const paperTexture = (p) =>
  `radial-gradient(circle at 15% 12%, ${p.pageEdge}88 0%, transparent 40%),` +
  `radial-gradient(circle at 85% 88%, ${p.pageEdge}66 0%, transparent 45%),` +
  `linear-gradient(180deg, ${p.pageBg} 0%, ${p.pageBg} 100%)`;

const fmtDate = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// ── A single book leaf (must forward a DOM ref for react-pageflip) ──────────
const Leaf = forwardRef(function Leaf({ children, palette, hard }, ref) {
  return (
    <div
      ref={ref}
      className="book-leaf"
      data-density={hard ? "hard" : "soft"}
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: paperTexture(palette),
        color: palette.ink,
        boxShadow: `inset 0 0 60px ${palette.pageEdge}`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
});

// ── Content page chrome (header / body / footer) ────────────────────────────
function ContentPage({ page, pageNumber, palette, docTitle, company, logo, genDate }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", padding: `${PAD_Y}px ${PAD_X}px`, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ height: HEADER_H, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${palette.gold}55`, fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: palette.faint, flexShrink: 0 }}>
        <span style={{ maxWidth: "62%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{docTitle}</span>
        <span style={{ color: palette.gold }}>{company || "Smart Blueprint"}</span>
      </div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ flex: 1, minHeight: 0, paddingTop: 14 }}
      >
        {page.isChapterStart && (
          <div style={{ marginBottom: 14 }}>
            <motion.div
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.gold, fontWeight: 600 }}
            >
              Chapter {page.chapterIndex + 1}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 27, lineHeight: 1.15, fontWeight: 800, color: palette.navy, margin: "4px 0 8px" }}
            >
              {page.chapterTitle}
            </motion.h1>
            <motion.div
              initial={{ width: 0 }} animate={{ width: 54 }}
              transition={{ duration: 0.55, delay: 0.32, ease: "easeOut" }}
              style={{ height: 3, background: palette.gold, borderRadius: 2 }}
            />
          </div>
        )}
        <div className="book-prose" style={{ width: CONTENT_W }}>
          {page.blocks.map((b) => (
            <ReportRenderer key={`${b.ci}:${b.bi}`} content={b.md} theme={palette.render} />
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ height: FOOTER_H, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${palette.gold}55`, fontFamily: "'Inter', sans-serif", fontSize: 9, color: palette.faint, flexShrink: 0 }}>
        <span>{genDate}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {logo ? <img src={logo} alt="" style={{ height: 14, opacity: 0.8 }} /> : <BookOpen size={11} style={{ color: palette.gold }} />}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{pageNumber}</span>
        </span>
      </div>
    </div>
  );
}

// ── Cover ───────────────────────────────────────────────────────────────────
function CoverPage({ palette, docTitle, company, logo, genDate, dark }) {
  const g1 = dark ? "#0b1426" : "#0f2147";
  const g2 = dark ? "#16233d" : "#1f3a6b";
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: `linear-gradient(150deg, ${g1} 0%, ${g2} 60%, ${g1} 100%)`, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 48px", boxSizing: "border-box" }}>
      {/* decorative gold rings */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 320, height: 320, borderRadius: "50%", border: `1px solid ${palette.gold}55` }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 260, height: 260, borderRadius: "50%", border: `1px solid ${palette.gold}33` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {logo ? <img src={logo} alt="" style={{ height: 30 }} /> : <BookOpen size={22} style={{ color: palette.gold }} />}
        <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase", color: palette.gold }}>
          {company || "Smart Project Blueprint"}
        </span>
      </div>

      <div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.gold, marginBottom: 16 }}>
          Business Feasibility Report
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, lineHeight: 1.1, fontWeight: 900, margin: 0 }}>
          {docTitle}
        </h1>
        <div style={{ width: 80, height: 4, background: palette.gold, borderRadius: 2, margin: "22px 0" }} />
        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: "italic", fontSize: 15, color: "#dbe4f5", maxWidth: 380, lineHeight: 1.6 }}>
          A comprehensive, AI-generated analysis of market opportunity, financial viability, and strategic roadmap.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "'Inter', sans-serif", fontSize: 11.5 }}>
        <div>
          <div style={{ color: palette.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 9.5, marginBottom: 4 }}>Prepared for</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{company || "Valued Client"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: palette.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 9.5, marginBottom: 4 }}>Generated by AI</div>
          <div style={{ fontSize: 13 }}>{genDate}</div>
        </div>
      </div>
    </div>
  );
}

// ── Table of contents ─────────────────────────────────────────────────────
function TOCPage({ palette, chapters, chapterStartPage, currentChapter, onJump }) {
  return (
    <div style={{ width: "100%", height: "100%", padding: `${PAD_Y}px ${PAD_X}px`, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: palette.navy, margin: 0 }}>Contents</h2>
      <div style={{ width: 60, height: 3, background: palette.gold, borderRadius: 2, margin: "12px 0 22px" }} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {chapters.map((c, i) => {
          const active = i === currentChapter;
          return (
            <button
              key={i}
              onClick={() => onJump(chapterStartPage[i])}
              style={{
                width: "100%", display: "flex", alignItems: "baseline", gap: 10, padding: "9px 10px", marginBottom: 2,
                background: active ? `${palette.gold}1f` : "transparent", border: "none", borderRadius: 8,
                cursor: "pointer", textAlign: "left", color: palette.ink,
                fontFamily: "'Merriweather', serif",
              }}
            >
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: palette.gold, minWidth: 22 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: active ? palette.navy : palette.ink, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title}
              </span>
              <span style={{ flex: "0 0 auto", borderBottom: `1px dotted ${palette.faint}`, minWidth: 24, alignSelf: "flex-end", margin: "0 6px 4px" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: palette.faint, fontVariantNumeric: "tabular-nums" }}>
                {chapterStartPage[i] + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 3D hardcover intro (closed book → opens) ───────────────────────────────
const CLOSED_W = 348;
const CLOSED_H = 492;

function BookCover3D({ palette, docTitle, company, genDate, dark, onOpen }) {
  const [opening, setOpening] = useState(false);
  const grad = `linear-gradient(145deg, ${dark ? "#0b1426" : "#0f2147"} 0%, ${dark ? "#1a2740" : "#23427c"} 60%, ${dark ? "#0b1426" : "#0f2147"} 100%)`;

  const open = () => { if (!opening) setOpening(true); };

  return (
    <motion.div
      key="cover3d"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, zIndex: 30 }}
    >
      <div style={{ perspective: 2000 }}>
        <motion.div
          initial={{ rotateZ: 0, y: 0 }} animate={opening ? { y: -6 } : { y: [0, -6, 0] }}
          transition={opening ? { duration: 0.3 } : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "relative", width: CLOSED_W, height: CLOSED_H, transformStyle: "preserve-3d" }}
        >
          {/* page block under the cover */}
          <div style={{ position: "absolute", inset: 0, transform: "translateZ(-6px)", background: "#fbf8f1", borderRadius: "3px 7px 7px 3px", boxShadow: "inset -8px 0 16px rgba(0,0,0,0.18)" }} />
          {/* stacked page edges (right side) */}
          <div style={{ position: "absolute", top: 6, bottom: 6, right: -5, width: 6, background: "repeating-linear-gradient(180deg, #efe9dc, #efe9dc 2px, #d8d0bd 3px)", borderRadius: 2 }} />
          {/* spine on the left */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -12, width: 26, transform: "rotateY(-72deg)", transformOrigin: "right center", background: "linear-gradient(90deg, #0a1326, #16294d)", borderRadius: "4px 0 0 4px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 12px rgba(0,0,0,0.5)" }}>
            <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: palette.gold, fontFamily: "'Inter', sans-serif", fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", maxHeight: "85%", overflow: "hidden" }}>
              {company || "Smart Project Blueprint"}
            </span>
          </div>
          {/* front cover (rotates open) */}
          <motion.div
            initial={{ rotateY: 0 }} animate={{ rotateY: opening ? -162 : 0 }}
            transition={{ duration: 1.15, ease: [0.22, 0.61, 0.36, 1] }}
            onAnimationComplete={() => { if (opening) onOpen(); }}
            onClick={open}
            style={{ position: "absolute", inset: 0, transformOrigin: "left center", transformStyle: "preserve-3d", backfaceVisibility: "hidden", cursor: "pointer", borderRadius: "3px 7px 7px 3px", background: grad, boxShadow: "0 34px 64px rgba(8,15,35,0.55)", color: "#fff", padding: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -90, right: -90, width: 230, height: 230, borderRadius: "50%", border: `1px solid ${palette.gold}55` }} />
            <div style={{ position: "absolute", bottom: -70, left: -70, width: 180, height: 180, borderRadius: "50%", border: `1px solid ${palette.gold}33` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={18} style={{ color: palette.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.2em", fontSize: 9.5, textTransform: "uppercase", color: palette.gold }}>{company || "Smart Project Blueprint"}</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: "0.3em", textTransform: "uppercase", color: palette.gold, marginBottom: 12 }}>Business Feasibility Report</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, lineHeight: 1.12, fontWeight: 900, margin: 0 }}>{docTitle}</h1>
              <div style={{ width: 64, height: 3, background: palette.gold, borderRadius: 2, marginTop: 16 }} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#cdd9f0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span>{genDate}</span>
              <span style={{ color: palette.gold }}>Tap to open ▸</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {!opening && (
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          onClick={open}
          style={{ padding: "11px 26px", borderRadius: 999, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${palette.navy}, ${palette.gold})`, color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(8,15,35,0.4)" }}
        >
          Open the report
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function BookReportViewer({ report, onBack, onSwitchClassic }) {
  const [dark, setDark] = useState(false);
  const [pages, setPages] = useState(null);     // packed content pages
  const [heights, setHeights] = useState(null); // measurement result
  const [currentPage, setCurrentPage] = useState(0);
  const [showThumbs, setShowThumbs] = useState(false);
  const [showTOCPanel, setShowTOCPanel] = useState(false);
  const [opened, setOpened] = useState(false);          // hardcover intro done
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isWide, setIsWide] = useState(true);

  const [downloading, setDownloading] = useState(null); // 'word' | 'excel' | null

  const flipRef = useRef(null);
  const containerRef = useRef(null);
  const measureRefs = useRef({});

  const doDownload = async (kind) => {
    if (downloading) return;
    setDownloading(kind);
    try {
      if (kind === "word") await downloadWord(report.id);
      else await downloadExcel(report.id);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const palette = dark ? PALETTES.dark : PALETTES.light;

  const { docTitle, chapters } = useMemo(
    () => parseReport(report?.report_content, report?.title || "Project Report"),
    [report?.report_content, report?.title]
  );

  const company = report?.promoter_name || report?.company_name || "";
  const logo = report?.logo_url || report?.company_logo || null;
  const genDate = fmtDate(report?.created_date || report?.created_at);

  // ── Measurement pass: render every block hidden, read its height once ──────
  useLayoutEffect(() => {
    const map = {};
    let ok = true;
    chapters.forEach((c, ci) =>
      c.blocks.forEach((_, bi) => {
        const el = measureRefs.current[`${ci}:${bi}`];
        if (!el) { ok = false; return; }
        map[`${ci}:${bi}`] = el.offsetHeight;
      })
    );
    if (ok) setHeights(map);
  }, [chapters]);

  // ── Pack into pages once heights are known ─────────────────────────────────
  useEffect(() => {
    if (!heights) return;
    const packed = packPages(chapters, (ci, bi) => heights[`${ci}:${bi}`], {
      budget: BUDGET, titleHeight: TITLE_H, blockGap: 14,
    });
    setPages(packed);
  }, [heights, chapters]);

  // Build the full leaf list: [cover, toc, ...content]
  const FRONT_MATTER = 2; // cover + toc
  const chapterStartPage = useMemo(() => {
    if (!pages) return [];
    const starts = [];
    pages.forEach((p, idx) => {
      if (p.isChapterStart) starts[p.chapterIndex] = FRONT_MATTER + idx;
    });
    return starts;
  }, [pages]);

  const totalLeaves = pages ? pages.length + FRONT_MATTER : FRONT_MATTER;
  const currentChapter = useMemo(() => {
    if (!pages || currentPage < FRONT_MATTER) return -1;
    return pages[currentPage - FRONT_MATTER]?.chapterIndex ?? -1;
  }, [pages, currentPage]);

  const goNext = useCallback(() => flipRef.current?.pageFlip()?.flipNext(), []);
  const goPrev = useCallback(() => flipRef.current?.pageFlip()?.flipPrev(), []);
  const goTo = useCallback((idx) => {
    flipRef.current?.pageFlip()?.turnToPage(idx);
    setCurrentPage(idx);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Responsive: two-page spread only when wide enough
  useEffect(() => {
    const m = window.matchMedia("(min-width: 900px)");
    const apply = () => setIsWide(m.matches);
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, []);

  // Bookmarks (persisted per report)
  const bmKey = report?.id ? `rc_bm_${report.id}` : null;
  useEffect(() => {
    if (!bmKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(bmKey) || "[]");
      if (Array.isArray(saved)) setBookmarks(saved);
    } catch { /* ignore */ }
  }, [bmKey]);

  const isBookmarked = bookmarks.includes(currentPage);
  const toggleBookmark = useCallback(() => {
    setBookmarks((prev) => {
      const next = prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage].sort((a, b) => a - b);
      try { if (bmKey) localStorage.setItem(bmKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [currentPage, bmKey]);

  const labelForPage = (idx) =>
    idx === 0 ? "Cover" : idx === 1 ? "Contents"
      : (pages && pages[idx - FRONT_MATTER]?.isChapterStart
        ? pages[idx - FRONT_MATTER].chapterTitle
        : `Page ${idx + 1}`);

  const progress = totalLeaves > 1 ? Math.round((currentPage / (totalLeaves - 1)) * 100) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: dark
          ? "radial-gradient(circle at 50% 0%, #232a3a 0%, #11141d 70%)"
          : "radial-gradient(circle at 50% 0%, #e9eef6 0%, #c9d3e3 70%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        transition: "background 0.4s ease",
      }}
    >
      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 1180, display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", flexWrap: "wrap" }}>
        <button onClick={onBack} style={barBtn(palette)} title="Back">
          <ArrowLeft size={16} /> <span style={{ fontSize: 13 }}>Back</span>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowTOCPanel((v) => !v)} style={barBtn(palette)} title="Contents"><List size={16} /></button>
        <button onClick={() => setShowThumbs((v) => !v)} style={barBtn(palette)} title="Page thumbnails"><LayoutGrid size={16} /></button>
        <button
          onClick={toggleBookmark}
          style={{ ...barBtn(palette), color: isBookmarked ? palette.gold : palette.ink, borderColor: isBookmarked ? palette.gold : palette.pageEdge }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
        >
          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
        <button onClick={() => setShowBookmarks((v) => !v)} style={barBtn(palette)} title="My bookmarks">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            <Bookmark size={14} /> {bookmarks.length}
          </span>
        </button>
        <button onClick={() => setDark((v) => !v)} style={barBtn(palette)} title="Toggle dark mode">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => doDownload("word")} disabled={!!downloading} style={{ ...barBtn(palette), fontSize: 12 }} title="Download Word report (.docx)">
          {downloading === "word" ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />} Word
        </button>
        <button onClick={() => doDownload("excel")} disabled={!!downloading} style={{ ...barBtn(palette), fontSize: 12 }} title="Download Excel financial model (.xlsx)">
          {downloading === "excel" ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />} Excel
        </button>
        {onSwitchClassic && (
          <button onClick={onSwitchClassic} style={{ ...barBtn(palette), fontSize: 12 }} title="Classic view with export & editing">
            Classic view
          </button>
        )}
      </div>

      {/* Book stage */}
      <div style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "8px 12px 28px", position: "relative" }}>
        {!pages ? (
          <div style={{ marginTop: 80, color: palette.faint, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <BookOpen size={28} className="animate-pulse" />
            <span>Binding your report…</span>
          </div>
        ) : (
          <div style={{ filter: "drop-shadow(0 30px 50px rgba(8,15,35,0.35))" }}>
            <HTMLFlipBook
              ref={flipRef}
              width={PAGE_W}
              height={PAGE_H}
              size="stretch"
              minWidth={300}
              maxWidth={620}
              minHeight={420}
              maxHeight={880}
              maxShadowOpacity={0.5}
              drawShadow
              flippingTime={780}
              showCover
              usePortrait
              mobileScrollSupport
              useMouseEvents
              swipeDistance={30}
              startZIndex={5}
              onFlip={(e) => setCurrentPage(e.data)}
              className="report-flipbook"
              style={{}}
            >
              <Leaf palette={palette} hard>
                <CoverPage palette={palette} docTitle={docTitle} company={company} logo={logo} genDate={genDate} dark={dark} />
              </Leaf>

              <Leaf palette={palette}>
                <TOCPage palette={palette} chapters={chapters} chapterStartPage={chapterStartPage} currentChapter={currentChapter} onJump={goTo} />
              </Leaf>

              {pages.map((p, i) => (
                <Leaf key={i} palette={palette}>
                  <ContentPage page={p} pageNumber={FRONT_MATTER + i + 1} palette={palette} docTitle={docTitle} company={company} logo={logo} genDate={genDate} />
                </Leaf>
              ))}
            </HTMLFlipBook>
          </div>
        )}

        {/* Center spine / binding over the gutter (two-page mode) */}
        {pages && opened && isWide && (
          <div aria-hidden style={{ position: "absolute", top: 78, bottom: 150, left: "50%", width: 20, transform: "translateX(-50%)", background: "linear-gradient(90deg, transparent, rgba(6,10,22,0.30) 45%, rgba(6,10,22,0.30) 55%, transparent)", filter: "blur(0.5px)", pointerEvents: "none", zIndex: 3 }} />
        )}

        {/* Bookmark ribbon on the current page */}
        <AnimatePresence>
          {pages && opened && isBookmarked && (
            <motion.div
              key="ribbon"
              initial={{ y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -28, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              style={{ position: "absolute", top: 4, right: isWide ? "29%" : "16%", width: 26, height: 56, background: `linear-gradient(180deg, ${palette.gold}, ${palette.gold}cc)`, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)", zIndex: 8, boxShadow: "0 5px 10px rgba(0,0,0,0.35)" }}
            />
          )}
        </AnimatePresence>

        {/* Hard-cover opening animation */}
        <AnimatePresence>
          {pages && !opened && (
            <BookCover3D
              palette={palette} docTitle={docTitle} company={company} genDate={genDate} dark={dark}
              onOpen={() => setOpened(true)}
            />
          )}
        </AnimatePresence>

        {/* Bookmarks overlay */}
        <AnimatePresence>
          {showBookmarks && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBookmarks(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(8,12,22,0.6)", backdropFilter: "blur(4px)", zIndex: 56, padding: 24, display: "flex", alignItems: "flex-start", justifyContent: "center" }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 70, width: 420, maxWidth: "92%", background: palette.pageBg, color: palette.ink, borderRadius: 14, padding: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 800, color: palette.navy }}>Bookmarks</span>
                  <button onClick={() => setShowBookmarks(false)} style={{ background: "none", border: "none", cursor: "pointer", color: palette.ink }}><X size={18} /></button>
                </div>
                {bookmarks.length === 0 ? (
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: palette.faint }}>
                    No bookmarks yet. Tap the <Bookmark size={12} style={{ display: "inline", verticalAlign: "middle" }} /> icon while reading to save a page.
                  </p>
                ) : (
                  bookmarks.map((idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 6px", borderBottom: `1px solid ${palette.pageEdge}` }}>
                      <BookmarkCheck size={15} style={{ color: palette.gold, flexShrink: 0 }} />
                      <button
                        onClick={() => { goTo(idx); setShowBookmarks(false); }}
                        style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: palette.ink, fontFamily: "'Merriweather',serif", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {labelForPage(idx)}
                      </button>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: palette.faint }}>p.{idx + 1}</span>
                      <button
                        onClick={() => setBookmarks((prev) => { const n = prev.filter((p) => p !== idx); try { if (bmKey) localStorage.setItem(bmKey, JSON.stringify(n)); } catch { /* ignore */ } return n; })}
                        style={{ background: "none", border: "none", cursor: "pointer", color: palette.faint }}
                        title="Remove"
                      ><X size={14} /></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnails overlay */}
        <AnimatePresence>
          {showThumbs && pages && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowThumbs(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(8,12,22,0.6)", backdropFilter: "blur(4px)", zIndex: 50, padding: 24, overflowY: "auto" }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 980, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>All pages</span>
                  <button onClick={() => setShowThumbs(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 14 }}>
                  {Array.from({ length: totalLeaves }).map((_, idx) => {
                    const label = idx === 0 ? "Cover" : idx === 1 ? "Contents" : `Page ${idx + 1}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => { goTo(idx); setShowThumbs(false); }}
                        style={{ cursor: "pointer", border: idx === currentPage ? `2px solid ${palette.gold}` : "2px solid transparent", borderRadius: 10, padding: 0, background: "transparent" }}
                      >
                        <div style={{ aspectRatio: `${PAGE_W}/${PAGE_H}`, background: paperTexture(palette), borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: palette.faint, fontFamily: "'Playfair Display',serif", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", overflow: "hidden", padding: 8, textAlign: "center" }}>
                          {idx >= FRONT_MATTER ? (pages[idx - FRONT_MATTER]?.isChapterStart ? pages[idx - FRONT_MATTER].chapterTitle : "…") : label}
                        </div>
                        <div style={{ color: "#cdd3e0", fontSize: 10.5, marginTop: 5, fontFamily: "'Inter',sans-serif" }}>{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOC side panel */}
        <AnimatePresence>
          {showTOCPanel && (
            <motion.div
              initial={{ x: -340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -340, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 320, background: palette.pageBg, color: palette.ink, zIndex: 55, boxShadow: "8px 0 30px rgba(0,0,0,0.3)", padding: 22, overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: palette.navy }}>Contents</span>
                <button onClick={() => setShowTOCPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: palette.ink }}><X size={18} /></button>
              </div>
              {chapters.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(chapterStartPage[i]); setShowTOCPanel(false); }}
                  style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, padding: "10px 8px", border: "none", borderRadius: 8, cursor: "pointer", background: i === currentChapter ? `${palette.gold}22` : "transparent", color: i === currentChapter ? palette.navy : palette.ink, fontFamily: "'Merriweather',serif", fontSize: 13.5, fontWeight: i === currentChapter ? 700 : 400 }}
                >
                  <span style={{ color: palette.gold, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      {pages && (
        <div style={{ width: "100%", maxWidth: 720, padding: "0 18px 26px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={goPrev} disabled={currentPage === 0} style={navBtn(palette, currentPage === 0)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 4, background: `${palette.faint}40`, overflow: "hidden" }}>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", background: `linear-gradient(90deg, ${palette.navy}, ${palette.gold})`, borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "'Inter',sans-serif", fontSize: 11.5, color: palette.ink }}>
                <span>Page {currentPage + 1} of {totalLeaves}</span>
                <span style={{ color: palette.gold, fontWeight: 600 }}>{progress}% read</span>
              </div>
            </div>
            <button onClick={goNext} disabled={currentPage >= totalLeaves - 1} style={navBtn(palette, currentPage >= totalLeaves - 1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Hidden measurer — renders every block once to read its height */}
      {!heights && (
        <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, width: CONTENT_W, visibility: "hidden", pointerEvents: "none" }}>
          <div className="book-prose" style={{ width: CONTENT_W }}>
            {chapters.map((c, ci) =>
              c.blocks.map((md, bi) => (
                <div key={`${ci}:${bi}`} ref={(el) => (measureRefs.current[`${ci}:${bi}`] = el)}>
                  <ReportRenderer content={md} theme={palette.render} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── small style helpers ──────────────────────────────────────────────────────
function barBtn(p) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px",
    background: p.pageBg, color: p.ink, border: `1px solid ${p.pageEdge}`,
    borderRadius: 9, cursor: "pointer", fontFamily: "'Inter', sans-serif",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };
}
function navBtn(p, disabled) {
  return {
    width: 44, height: 44, borderRadius: "50%", border: "none",
    background: disabled ? `${p.faint}55` : `linear-gradient(135deg, ${p.navy}, ${p.gold})`,
    color: "#fff", cursor: disabled ? "default" : "pointer", flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    boxShadow: disabled ? "none" : "0 6px 16px rgba(8,15,35,0.3)",
    opacity: disabled ? 0.5 : 1,
  };
}
