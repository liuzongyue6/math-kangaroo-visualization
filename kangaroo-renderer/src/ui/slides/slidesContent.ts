/** Shared types for class-slide (PPT->PDF) content. The actual deck list is
 * NOT hand-maintained here — it's auto-discovered at build time by
 * scripts/build-slides-manifest.mjs, which scans public/slides/<grade>/*.pdf
 * and writes public/slides/manifest.json (fetched at runtime by
 * SlidesPage). Just drop a converted PDF into the right grade folder and
 * it shows up automatically; no code changes needed. Optionally give it a
 * nicer display title/date via public/slides/titles.json (see
 * public/slides/README.txt). */

export type SlideGrade = 'MK_G1_2' | 'MK_G5_6';

export type SlideDeck = {
  id: string;
  grade: SlideGrade;
  /** Display title shown in the lesson list, e.g. '第1讲：图形与规律'.
   * Auto-derived from the filename unless overridden in titles.json. */
  title: string;
  /** 'YYYY-MM-DD', shown as a secondary caption; optional. */
  date?: string;
  /** Path under public/, e.g. '/slides/MK_G1_2/foo.pdf'. */
  fileSrc: string;
};

export type SlideManifest = {
  decks: SlideDeck[];
};

/** Human-readable label + display order for each grade band. */
export const SLIDE_GRADE_LABELS: Record<SlideGrade, string> = {
  MK_G1_2: 'Grade 1-2',
  MK_G5_6: 'Grade 5-6',
};
