/**
 * paginateReport.js
 *
 * Turns a single markdown report into book chapters and then packs those
 * chapters' content blocks into fixed-height "pages" using heights measured
 * from the real DOM. Rendering still goes through ReportRenderer, so charts
 * and styled tables are preserved.
 */

const HEADING_RE = /^(#{1,2})\s+(.+?)\s*#*\s*$/;

/**
 * Parse markdown into { docTitle, chapters: [{ title, blocks: [md, ...] }] }.
 * Chapters break on level-1 and level-2 headings. The first H1 becomes the
 * document title used on the cover.
 */
export function parseReport(markdown, fallbackTitle = "Project Report") {
  const text = (markdown || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  const sections = [];
  let current = null;
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line.trim())) inFence = !inFence;
    const m = !inFence && line.match(HEADING_RE);
    if (m) {
      if (current) sections.push(current);
      current = { level: m[1].length, title: m[2].trim(), bodyLines: [] };
    } else {
      if (!current) current = { level: 0, title: null, bodyLines: [] };
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);

  let docTitle = fallbackTitle;
  let chapterSections = sections;

  // A leading H1 (or untitled preamble that holds the title) → cover title.
  if (sections.length && (sections[0].level === 1 || sections[0].level === 0)) {
    if (sections[0].title) docTitle = sections[0].title;
    const leadBody = sections[0].bodyLines.join("\n").trim();
    // Drop the title section unless it carries real intro content.
    chapterSections = leadBody.length > 220 ? sections : sections.slice(1);
    if (chapterSections === sections) {
      chapterSections = [{ ...sections[0], title: sections[0].title || "Overview" }, ...sections.slice(1)];
    }
  }

  const chapters = chapterSections
    .map((s) => ({
      title: s.title || "Overview",
      blocks: splitBlocks(s.bodyLines.join("\n")),
    }))
    .filter((c) => c.title || c.blocks.length);

  if (!chapters.length) {
    chapters.push({ title: "Report", blocks: splitBlocks(text) });
  }

  return { docTitle, chapters };
}

/**
 * Split a markdown body into self-contained blocks. Blocks are separated by
 * blank lines; tables, lists and fenced code (which have no internal blank
 * lines) naturally stay together as one block.
 */
export function splitBlocks(body) {
  const lines = (body || "").split("\n");
  const blocks = [];
  let buf = [];
  let inFence = false;

  const flush = () => {
    const joined = buf.join("\n").trim();
    if (joined) blocks.push(joined);
    buf = [];
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      buf.push(line);
      continue;
    }
    if (!inFence && line.trim() === "") {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

/**
 * Pack chapter blocks into pages given a height lookup.
 *
 * getHeight(chapterIndex, blockIndex) -> measured px height of that block.
 *
 * Returns pages: [{ chapterIndex, chapterTitle, isChapterStart, blocks: [{ci, bi, md}] }]
 * Each chapter always starts on a fresh page.
 */
export function packPages(chapters, getHeight, opts = {}) {
  const budget = opts.budget ?? 620;        // usable content height per page
  const titleHeight = opts.titleHeight ?? 96; // space a chapter title consumes
  const blockGap = opts.blockGap ?? 14;

  const pages = [];

  chapters.forEach((chapter, ci) => {
    let pageBudget = budget - titleHeight; // first page of a chapter shows the title
    let used = 0;
    let page = { chapterIndex: ci, chapterTitle: chapter.title, isChapterStart: true, blocks: [] };

    chapter.blocks.forEach((md, bi) => {
      const h = getHeight(ci, bi) || 0;
      const needed = h + (page.blocks.length ? blockGap : 0);
      if (page.blocks.length && used + needed > pageBudget) {
        pages.push(page);
        page = { chapterIndex: ci, chapterTitle: chapter.title, isChapterStart: false, blocks: [] };
        pageBudget = budget;
        used = 0;
      }
      page.blocks.push({ ci, bi, md });
      used += needed;
    });

    pages.push(page); // flush last (or only) page of the chapter
  });

  return pages;
}
