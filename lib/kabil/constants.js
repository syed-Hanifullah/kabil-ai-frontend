/**
 * Closed sets from the backend, as JS for dropdowns / labels / badges.
 * Mirrors docs/ENUMS.md. Keep values in sync with the backend.
 */

export const EMPLOYMENT_TYPES = ["permanent", "contract", "temporary"];
export const WORK_MODES = ["onsite", "hybrid", "remote"];
export const NOTICE_PERIODS = ["any", "immediate", "30d", "60d", "90d"];
export const VISA_REQUIREMENTS = ["any", "citizen_or_resident", "sponsorship_offered"];

export const JOB_STATUSES = ["draft", "open", "closed"];
export const APPLICATION_STAGES = [
  "vector_screen",
  "hard_filter",
  "whatsapp",
  "interview",
  "done",
];
export const APPLICATION_STATUSES = ["active", "rejected", "accepted"];

export const APPLICATION_LIST_ORDERS = [
  "-created_at",
  "created_at",
  "-similarity_score",
  "similarity_score",
  "-hard_filter_score",
  "hard_filter_score",
  "-stage_updated_at",
];

/** Forward-only stage transitions (source of truth: backend stages enum). */
export const NEXT_STAGE = {
  vector_screen: "hard_filter",
  hard_filter: "whatsapp",
  whatsapp: "interview",
  interview: "done",
  done: null,
};

/** Allowed status transitions. */
export const NEXT_STATUSES = {
  active: ["rejected", "accepted"],
  rejected: ["active"],
  accepted: [],
};

export const BULK_REJECTION_LABELS = {
  not_pdf: "Not a valid PDF",
  too_large: "Exceeds 10 MB limit",
  duplicate_in_batch: "Duplicate file in this upload",
  parse_failed_no_contact: "Couldn't extract contact info",
  over_limit: "Exceeds the per-upload file limit",
};

/* ── CV Inbox ──────────────────────────────────────────────────────────── */

/** Where the recruiter sourced the CVs (UI metadata for the upload form). */
export const CV_SOURCES = [
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "bayt", label: "Bayt", emoji: "🌐" },
  { value: "naukrigulf", label: "Naukrigulf", emoji: "🌐" },
  { value: "indeed", label: "Indeed", emoji: "🔎" },
  { value: "referral", label: "Referral", emoji: "🤝" },
  { value: "email", label: "Email", emoji: "✉️" },
  { value: "career_page", label: "Career page", emoji: "🏢" },
  { value: "other", label: "Other", emoji: "📎" },
];

/** The three-stage flow shown in the CV Inbox banner. */
export const CV_INBOX_STEPS = [
  { n: 1, label: "Upload", tone: "primary" },
  { n: 2, label: "AI Parses", tone: "gold" },
  { n: 3, label: "Job Pipeline", tone: "primary" },
];

export const CV_INBOX_HINT =
  "Parsed CVs land in the matched job's Applied column for recruiter review.";

/** `accept` attribute for the file picker — the backend only ingests PDFs. */
export const CV_ACCEPT = ".pdf,application/pdf";

export const PDPL_CONSENT_LABEL = "PDPL Consent (Required)";
export const PDPL_CONSENT_TEXT =
  "I confirm these candidates consented to their data being processed for recruitment purposes, in compliance with UAE PDPL Article 4.";

/* ── Pipeline board ──────────────────────────────────────────────────────── */

/**
 * Kanban columns: backend `ApplicationStage` → recruiter-facing label, a short
 * tag for the summary strip, and the accent color drawn along the column's top
 * edge. Order matches the forward-only pipeline.
 */
export const PIPELINE_COLUMNS = [
  { stage: "vector_screen", label: "Applied", short: "Applied", accent: "#1f9d57" },
  { stage: "hard_filter", label: "L1 — CV Screened", short: "L1", accent: "#c9a23f" },
  { stage: "whatsapp", label: "L2 — WA Screened", short: "L2", accent: "#2f7fd1" },
  { stage: "interview", label: "L3 — Interviewed", short: "L3", accent: "#8155c9" },
  { stage: "done", label: "Final Shortlist", short: "Final", accent: "#1f9d57" },
];

/** Status filter chips above the board. `value: null` = show every candidate. */
export const PIPELINE_STATUS_FILTERS = [
  { value: "accepted", label: "Accepted", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
];

/** Authenticity band → MUI palette color (for Chip/Alert `color` props). */
export const bandColor = (band) => {
  switch (band) {
    case "authentic":
      return "success";
    case "review":
      return "warning";
    case "fabricated":
      return "error";
    default:
      return "default";
  }
};

/** Job status → MUI palette color. */
export const jobStatusColor = (status) => {
  switch (status) {
    case "open":
      return "success";
    case "draft":
      return "default";
    case "closed":
      return "error";
    default:
      return "default";
  }
};

/** Application status → MUI palette color. */
export const statusColor = (status) => {
  switch (status) {
    case "active":
      return "info";
    case "rejected":
      return "error";
    case "accepted":
      return "success";
    default:
      return "default";
  }
};

/**
 * Recruiter recommendation derived from a 0–100 score. Frontend heuristic that
 * reuses the documented authenticity-band thresholds (≥75 / ≥50 / <50).
 */
/**
 * Coerce a raw score from the API into a finite number, or null.
 * Tolerates strings with a trailing "%" (e.g. "85%") and non-numeric values.
 */
export const toScore = (raw) => {
  if (raw == null) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};

export const scoreBand = (raw) => {
  const score = toScore(raw);
  if (score == null) return { label: "Pending", color: "default" };
  if (score >= 75) return { label: "Advance", color: "success" };
  if (score >= 50) return { label: "Review", color: "warning" };
  return { label: "Hold", color: "error" };
};

/** Authenticity band → recruiter-facing label. */
export const authenticityLabel = (band) => {
  switch (band) {
    case "authentic":
      return "Authentic";
    case "review":
      return "Needs review";
    case "fabricated":
      return "Flagged";
    default:
      return "Unscored";
  }
};

/** Compact relative time, e.g. "11 days ago". */
export const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const units = [
    ["year", 31536000000],
    ["month", 2592000000],
    ["week", 604800000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];
  for (const [unit, ms] of units) {
    const n = Math.floor(diff / ms);
    if (n >= 1) return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
};

/** Human label for an enum-ish value: "vector_screen" -> "Vector screen". */
export const humanize = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
};

export const PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const BULK_MAX_FILES = 50;
export const CV_MAX_MB = 10;

/* ── WhatsApp screening (GET /applications/{id}/whatsapp) ────────────────── */

/** Conversation lifecycle. awaiting_interest → asking_questions → completed,
 *  or → declined on a "No". completed / declined are terminal. */
export const WHATSAPP_CONVERSATION_STATES = [
  "awaiting_interest",
  "asking_questions",
  "completed",
  "declined",
];

/** Who sent a transcript message. */
export const WHATSAPP_DIRECTIONS = ["outbound", "inbound"];

/** Transcript message payload kinds (open-ended on the backend). */
export const WHATSAPP_MESSAGE_TYPES = ["text", "interactive_buttons", "button_reply"];

/** Interest quick-reply button ids (appear in a button_reply's `button_id`). */
export const WHATSAPP_BUTTON_IDS = { YES: "interest_yes", NO: "interest_no" };

/** Conversation state → recruiter-facing label + MUI palette color. */
export const whatsappStateLabel = (state) => {
  switch (state) {
    case "awaiting_interest":
      return { label: "Awaiting interest", color: "info" };
    case "asking_questions":
      return { label: "Answering questions", color: "warning" };
    case "completed":
      return { label: "Completed", color: "success" };
    case "declined":
      return { label: "Declined", color: "error" };
    default:
      return { label: "Not started", color: "default" };
  }
};

/* ── Talent pool (/talent-pool/*) ────────────────────────────────────────── */

export const TALENT_POOL_SEARCH_MIN_LENGTH = 1;
export const TALENT_POOL_SEARCH_MAX_LENGTH = 1000;
export const TALENT_POOL_SEARCH_DEFAULT_LIMIT = 10;
export const TALENT_POOL_SEARCH_MAX_LIMIT = 50;

/**
 * Talent-pool search similarity is a plain 0–100 number (cosine, higher = closer)
 * — NOT a percentage string like application scores. Map it to a palette color
 * for the "match" chip.
 */
export const poolMatchColor = (score) => {
  const n = toScore(score);
  if (n == null) return "default";
  if (n >= 75) return "success";
  if (n >= 50) return "warning";
  return "default";
};
