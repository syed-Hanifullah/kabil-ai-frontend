"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { toScore, scoreBand, timeAgo, humanize, APPLICATION_STAGES } from "@/lib/kabil/constants";
import { useSubmitInterviewFeedback } from "@/lib/kabil/queries";
import ErrorAlert from "@/components/ErrorAlert";
import { COLORS } from "@/lib/theme";

/** HR interview mark bounds — mirrors the backend `INTERVIEW_SCORE_*` thresholds. */
const INTERVIEW_SCORE_MIN = 0;
const INTERVIEW_SCORE_MAX = 100;

const asArray = (v) => (Array.isArray(v) ? v : []);
const findScore = (scores, type) => asArray(scores).find((s) => s?.score_type === type);

/** 0–100 → "65" or "37.8" (one decimal only when it isn't whole). */
const fmtPct = (v) => (v == null ? "—" : Number.isInteger(v) ? `${v}` : v.toFixed(1));

/* ── Shared visual language ────────────────────────────────────────────────── */

const GREEN = "#0F6E56";
const CARD_BG = "#FBF9F2";
const CARD_BORDER = "#ECE5D6";
const TRACK = "#E7E1D2";

/** scoreBand() palette name → a concrete brand hex (gold for the mid band, to
 *  match the cream/gold scoring cards). */
const bandHex = (band) =>
  ({ success: "#1f9d57", warning: COLORS.gold, error: "#d24a39" })[band] || "#9aa3a0";

const cardSx = {
  bgcolor: CARD_BG,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 2.5,
  overflow: "hidden",
};

/** The five authenticity sub-signals, in the order the recruiter reads them.
 *  Keys are the backend SignalKey values; labels/tips are recruiter-facing. */
const TRUST_SIGNALS = [
  {
    key: "consistency",
    label: "Claims vs Evidence",
    tip: "Does the experience claimed match the actual work history?",
  },
  {
    key: "specificity",
    label: "Detail Quality",
    tip: "Are specific projects, clients, and outcomes mentioned?",
  },
  {
    key: "timeline_coherence",
    label: "Skills Traceability",
    tip: "Can each listed skill be found in the actual work history?",
  },
  {
    key: "linguistic_genericity",
    label: "AI Language Check",
    tip: "Does the CV lean on generic AI / corporate buzzwords?",
  },
  {
    key: "structural_templating",
    label: "AI Formatting Check",
    tip: "Do the bullets / punctuation show AI-generated templating?",
  },
];

/** CV authenticity verdict bands — score → recruiter-facing badge. */
const TRUST_BADGES = [
  { min: 75, label: "Authentic", color: "success" },
  { min: 50, label: "Review", color: "warning" },
  { min: 0, label: "Likely Fabricated", color: "error" },
];
const trustBadge = (value) => TRUST_BADGES.find((b) => value >= b.min) || TRUST_BADGES[2];

/** Solid, band-coloured score disc (white numeral), mirroring the mock. */
const ScoreBadge = ({ value, size = 44 }) => {
  const has = value != null;
  const color = has ? bandHex(scoreBand(value).color) : "#c4c8c4";
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {has ? Math.round(value) : "—"}
    </Box>
  );
};

/** Green "Breakdown ⌄" toggle that sits in a card footer. */
const BreakdownToggle = ({ open, onClick }) => (
  <Button
    onClick={onClick}
    disableRipple
    size="small"
    endIcon={
      <ExpandMoreIcon
        sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
      />
    }
    sx={{ color: GREEN, fontWeight: 700, minWidth: 0, p: 0, "&:hover": { bgcolor: "transparent" } }}
  >
    {open ? "Hide Breakdown" : "Breakdown"}
  </Button>
);

/** Small green section eyebrow ("Score"). */
const Eyebrow = ({ children }) => (
  <Typography sx={{ color: GREEN, fontWeight: 800, fontSize: 11, letterSpacing: 0.5, mb: 1 }}>
    {children}
  </Typography>
);

/* ── Rows (stacked inside the single Credibility Check card) ─────────────────── */

/** One row inside the unified card; a hairline separates it from the next (the
 *  last row has none). */
const RowShell = ({ children }) => (
  <Box sx={{ px: 2, py: 1.75, "&:not(:last-of-type)": { borderBottom: `1px solid ${CARD_BORDER}` } }}>
    {children}
  </Box>
);

/** A numeric score row (CV Score, Background Validation): title + meter + score
 *  disc, with an optional expandable breakdown drawer + computed footer. */
const MeterRow = ({ label, value, computedAt, showFooter = true, children }) => {
  const [open, setOpen] = useState(false);
  const has = value != null;
  const color = has ? bandHex(scoreBand(value).color) : TRACK;
  const hasBreakdown = !!children;
  return (
    <RowShell>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.775rem", mb: 1 }}>{label}</Typography>
          <LinearProgress
            variant="determinate"
            value={has ? Math.min(100, Math.max(0, value)) : 0}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: TRACK,
              "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
            }}
          />
        </Box>
        <ScoreBadge value={value} />
      </Stack>

      {hasBreakdown && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 1.75 }}>
            <Stack spacing={2.5}>{children}</Stack>
          </Box>
        </Collapse>
      )}

      {/* Footer sits at the bottom, so expanded detail nests above it. */}
      {showFooter && (computedAt || hasBreakdown) && (
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {computedAt ? `Computed ${timeAgo(computedAt)}` : "—"}
          </Typography>
          {hasBreakdown && <BreakdownToggle open={open} onClick={() => setOpen((o) => !o)} />}
        </Stack>
      )}
    </RowShell>
  );
};

/** CV Authenticity verdict row: title + coloured band label + concern summary,
 *  with an expandable breakdown drawer (signals + key flags). */
const AuthenticityRow = ({ value, summary, breakdown, flags }) => {
  const [open, setOpen] = useState(false);
  const badge = trustBadge(value);
  const labelColor = bandHex(badge.color);
  const hasFlags = asArray(flags).length > 0;
  const hasBreakdown = (breakdown && Object.keys(breakdown).length > 0) || hasFlags;
  return (
    <RowShell>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.775rem" }}>CV Authenticity</Typography>
        <Typography sx={{ fontWeight: 700, color: labelColor, flexShrink: 0, whiteSpace: "nowrap" }}>
          {badge.label}
        </Typography>
      </Stack>
      {summary && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
          {summary}
        </Typography>
      )}
      {hasBreakdown && (
        <>
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 0.5 }}>
            <BreakdownToggle open={open} onClick={() => setOpen((o) => !o)} />
          </Stack>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ pt: 1 }}>
              <Stack spacing={2}>
                <TrustBreakdown breakdown={breakdown} />
                {hasFlags && <KeyFlags flags={flags} />}
              </Stack>
            </Box>
          </Collapse>
        </>
      )}
    </RowShell>
  );
};

/** Eligibility Questions row: the candidate's verbatim answers to the six fixed
 *  WhatsApp screening questions, shown as an open-by-default breakdown. */
const EligibilityRow = ({ items, computedAt }) => {
  const [open, setOpen] = useState(true); // open by default per the mock
  return (
    <RowShell>
      <Typography sx={{ fontWeight: 700, fontSize: "0.775rem" }}>Eligibility Questions</Typography>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Stack sx={{ mt: 1.25 }}>
          {items.map((it) => (
            <Stack
              key={it.label}
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                py: 1,
                borderBottom: "1px solid",
                borderColor: "action.hover",
                "&:last-of-type": { border: 0 },
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: GREEN, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{it.label}</Typography>
              </Stack>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: it.value ? GREEN : "text.disabled",
                  textAlign: "right",
                  wordBreak: "break-word",
                }}
              >
                {it.value ?? "—"}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Collapse>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", pt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {computedAt ? `Computed ${timeAgo(computedAt)}` : "—"}
        </Typography>
        <BreakdownToggle open={open} onClick={() => setOpen((o) => !o)} />
      </Stack>
    </RowShell>
  );
};

/** Empty placeholder row when a score family hasn't been computed yet. */
const PendingRow = ({ label }) => (
  <RowShell>
    <Typography sx={{ fontWeight: 700, fontSize: "0.775rem" }}>{label}</Typography>
    <Typography variant="caption" color="text.secondary">
      Not computed yet.
    </Typography>
  </RowShell>
);

/** Interview Scoring row: HR's manual post-interview mark + comment.
 *  Fresh (no mark yet): the breakdown opens by default onto the entry form.
 *  Once a mark exists: it shows as a score disc and the breakdown stays
 *  collapsed. While the app is at the interview stage HR can (re)open the form
 *  to edit; past that it's read-only (the comment, if any). */
const InterviewScoringRow = ({ appId, feedback, editable }) => {
  const scoreVal = toScore(feedback?.score);
  const has = scoreVal != null;
  const [open, setOpen] = useState(!has); // fresh → open onto the form
  const [marks, setMarks] = useState(has ? String(Math.round(scoreVal)) : "");
  const [comment, setComment] = useState(feedback?.comment || "");
  const submit = useSubmitInterviewFeedback(appId);

  const trimmed = marks.trim();
  const marksNum = trimmed === "" ? null : Number(trimmed);
  const marksValid =
    marksNum != null &&
    Number.isFinite(marksNum) &&
    marksNum >= INTERVIEW_SCORE_MIN &&
    marksNum <= INTERVIEW_SCORE_MAX;
  const canSave = editable && marksValid && !submit.isPending;

  const save = () => {
    if (!canSave) return;
    submit.mutate(
      { score: marksNum, comment: comment.trim() || null },
      { onSuccess: () => setOpen(false) },
    );
  };

  const hasDrawer = editable || !!feedback?.comment;

  return (
    <RowShell>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.775rem" }}>Interview Scoring</Typography>
          <Typography variant="caption" color="text.secondary">
            {has ? (feedback?.scoredAt ? timeAgo(feedback.scoredAt) : "Scored") : "Not scored yet"}
          </Typography>
        </Box>
        {has && <ScoreBadge value={scoreVal} />}
      </Stack>

      {hasDrawer && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 1.5 }}>
            {editable ? (
              <Stack spacing={1.5}>
                <TextField
                  label="Marks (0–100)"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  type="number"
                  size="small"
                  inputProps={{ min: INTERVIEW_SCORE_MIN, max: INTERVIEW_SCORE_MAX }}
                  error={trimmed !== "" && !marksValid}
                  helperText={trimmed !== "" && !marksValid ? "Enter a number from 0 to 100." : " "}
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  minRows={2}
                  size="small"
                  inputProps={{ maxLength: 2000 }}
                  fullWidth
                />
                {submit.isError && <ErrorAlert error={submit.error} />}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={save}
                    disabled={!canSave}
                    sx={{ bgcolor: GREEN, "&:hover": { bgcolor: "#0c5a46" } }}
                  >
                    {submit.isPending ? "Saving…" : has ? "Update marks" : "Save marks"}
                  </Button>
                </Box>
              </Stack>
            ) : (
              feedback?.comment && (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {feedback.comment}
                </Typography>
              )
            )}
          </Box>
        </Collapse>
      )}

      {hasDrawer && (
        <Stack direction="row" sx={{ justifyContent: "flex-end", pt: 1 }}>
          <BreakdownToggle open={open} onClick={() => setOpen((o) => !o)} />
        </Stack>
      )}
    </RowShell>
  );
};

/** Final-shortlist row: a plain verdict, no score or breakdown. */
const ShortlistRow = () => (
  <RowShell>
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.775rem" }}>Shortlist</Typography>
      <Typography sx={{ fontWeight: 700, color: "#1f9d57", whiteSpace: "nowrap" }}>Shortlisted</Typography>
    </Stack>
  </RowShell>
);

/* ── Breakdown bodies ──────────────────────────────────────────────────────── */

/** One labelled signal inside a detailed breakdown (label + reasons, no score). */
const SignalBar = ({ label, tip, children }) => (
  <Box>
    {tip ? (
      <Tooltip title={tip} arrow placement="top">
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            borderBottom: "1px dotted",
            borderColor: "text.disabled",
            cursor: "help",
            display: "inline-block",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
        {label}
      </Typography>
    )}
    {children}
  </Box>
);

/** Small wrapping row of coloured skill chips with an optional lead label. */
const ChipRow = ({ lead, items, color, leadingIcon, max }) => {
  const list = asArray(items);
  if (!list.length) return null;
  const shown = max != null ? list.slice(0, max) : list;
  const extra = list.length - shown.length;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", mt: 0.75 }}>
      {lead && (
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.25 }}>
          {lead}
        </Typography>
      )}
      {shown.map((s, i) => (
        <Chip
          key={`${s}-${i}`}
          size="small"
          color={color}
          variant="outlined"
          icon={leadingIcon}
          label={String(s)}
          sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 11 } }}
        />
      ))}
      {extra > 0 && (
        <Chip
          size="small"
          variant="outlined"
          label={`+${extra} more`}
          sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 11 } }}
        />
      )}
    </Box>
  );
};

const JdBreakdown = ({ b }) => {
  const total = b?.required_skills_total ?? 0;
  const matched = b?.required_skills_matched ?? 0;
  const prefTotal = b?.preferred_skills_total ?? 0;
  const threshold = b?.threshold_similarity;
  const passes = b?.passes_threshold;
  return (
    <>
      <Box>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Skills found on CV
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
            {matched} of {total}
          </Typography>
        </Stack>
        <ChipRow items={b?.matched_required_skills} color="success" leadingIcon={<CheckIcon />} />
        {matched === 0 && (
          <Typography variant="caption" color="text.disabled">
            None of the required skills were found on the CV.
          </Typography>
        )}
      </Box>
      <Divider />
      <Box>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Skills gaps
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>
            {Math.max(0, total - matched)} missing
          </Typography>
        </Stack>
        <ChipRow items={b?.missing_required_skills} color="error" />
        {total - matched <= 0 && (
          <Typography variant="caption" color="text.disabled">
            No gaps — every required skill is present.
          </Typography>
        )}
      </Box>
      <Divider />
      <Box>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Bonus skills required
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {prefTotal}
          </Typography>
        </Stack>
        {prefTotal > 0 ? (
          <>
            <ChipRow lead="Matched:" items={b?.matched_preferred_skills} color="success" leadingIcon={<CheckIcon />} />
            <ChipRow lead="Missing:" items={b?.missing_preferred_skills} color="warning" />
          </>
        ) : (
          <Typography variant="caption" color="text.disabled">
            No preferred skills configured for this role.
          </Typography>
        )}
      </Box>
      {passes != null && (
        <>
          <Divider />
          <Box>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Meets minimum
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: passes ? "success.main" : "error.main" }}>
                {passes ? "Yes" : "No"}
              </Typography>
            </Stack>
            {threshold != null && (
              <Typography variant="caption" color="text.disabled">
                {passes ? "Passes" : "Below"} the minimum threshold of {fmtPct(toScore(threshold))}.
              </Typography>
            )}
          </Box>
        </>
      )}
    </>
  );
};

const TrustBreakdown = ({ breakdown }) =>
  TRUST_SIGNALS.map(({ key, label, tip }) => {
    const sig = breakdown?.[key];
    if (!sig) return null;
    const desc = asArray(sig.reasons).join(" ");
    const details = sig.details || {};
    return (
      <SignalBar key={key} label={label} tip={tip}>
        {desc && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
            {desc}
          </Typography>
        )}
        {key === "timeline_coherence" && (
          <ChipRow lead="Can't trace:" items={details.unmatched} color="error" max={7} />
        )}
        {key === "linguistic_genericity" && details.top_markers && (
          <ChipRow lead="Flagged terms:" items={Object.keys(details.top_markers)} color="warning" />
        )}
      </SignalBar>
    );
  });

/* The hard-filter (CV Score) rubric: an open-ended `{ criterion: … }` map where
 * each criterion typically carries a numeric `score` (a percent string per the
 * API) plus a prose reason — but the leaf shape and field names vary. Extract
 * the score + reason defensively, and render any remaining structure generically
 * so nothing is ever silently dropped. Meta leaves (model/version/…) are skipped. */
const RUBRIC_META_KEYS = new Set(["computed_by", "model", "model_used", "version", "id"]);
const SCORE_KEYS = ["score", "points", "points_awarded", "awarded", "rating", "mark", "value"];
const WEIGHT_KEYS = ["weight", "max", "max_points", "out_of"];
const REASON_KEYS = [
  "reason", "reasoning", "explanation", "description", "detail", "details",
  "notes", "note", "rationale", "comment", "comments", "justification",
  "summary", "text", "feedback", "remark", "remarks", "analysis",
];
const NUMERIC_RE = /^\s*\d+(\.\d+)?%?\s*$/;
const SMALL_WORDS = new Set(["and", "or", "of", "the", "to", "a", "for", "in", "on", "with"]);

const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
const firstKey = (obj, keys) => keys.find((k) => obj[k] != null && obj[k] !== "");

/** snake_case / loose key → Title Case ("role_and_seniority" → "Role and Seniority"). */
const titleCase = (key) =>
  String(key)
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && SMALL_WORDS.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");

const padScore = (n) => (n == null ? null : String(Math.round(n)).padStart(2, "0"));

/** The numeric points for a rubric criterion, whatever leaf shape it takes. */
const rubricScore = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return NUMERIC_RE.test(v) ? toScore(v) : null;
  if (isObj(v)) {
    const k = firstKey(v, SCORE_KEYS);
    return k ? toScore(v[k]) : null;
  }
  return null;
};

/** The reason / explanation prose for a rubric criterion. */
const rubricText = (v) => {
  if (typeof v === "string") return NUMERIC_RE.test(v) ? "" : v;
  if (Array.isArray(v)) return v.every((x) => !isObj(x) && !Array.isArray(x)) ? v.join(", ") : "";
  if (isObj(v)) {
    const k = firstKey(v, REASON_KEYS);
    if (k) return String(v[k]);
    if (Array.isArray(v.reasons)) return v.reasons.join(" ");
    if (Array.isArray(v.evidence)) return v.evidence.join(" ");
  }
  return "";
};

/** A primitive leaf → display string ("" for objects/arrays, handled by Tree). */
const leafString = (v) => {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.every((x) => !isObj(x)) ? v.join(", ") : "";
  if (typeof v === "object") return "";
  return String(v);
};

/** Generic indented renderer for any leftover nested structure. */
const Tree = ({ data }) => {
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i + 1), v]) : Object.entries(data || {});
  return (
    <Stack spacing={0.75} sx={{ pl: 2.25, mt: 0.75 }}>
      {entries.map(([k, v]) =>
        isObj(v) || (Array.isArray(v) && v.some(isObj)) ? (
          <Box key={k}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {titleCase(k)}
            </Typography>
            <Tree data={v} />
          </Box>
        ) : (
          <Stack key={k} direction="row" spacing={1.5} sx={{ justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              {titleCase(k)}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, textAlign: "right", wordBreak: "break-word" }}>
              {leafString(v) || "—"}
            </Typography>
          </Stack>
        ),
      )}
    </Stack>
  );
};

/** Keys already surfaced as score / weight / reason — dropped from the leftover Tree. */
const consumedKeys = (v) => {
  const used = new Set();
  if (isObj(v)) {
    const sk = firstKey(v, SCORE_KEYS);
    const wk = firstKey(v, WEIGHT_KEYS);
    const rk = firstKey(v, REASON_KEYS);
    if (sk) used.add(sk);
    if (wk) used.add(wk);
    if (rk) used.add(rk);
  }
  return used;
};

/* The five documented hard-filter signals (ENUMS.md: skills / experience /
 * industry / regional / role-seniority), in weight order, mapped to the
 * recruiter-facing labels from the mock. Keys are matched flexibly so minor
 * backend spelling differences (e.g. `role_seniority` vs `role_and_seniority`)
 * still resolve. */
const HARD_FILTER_SIGNALS = [
  { keys: ["skills", "skill"], label: "Skills" },
  { keys: ["experience"], label: "Experience" },
  { keys: ["industry", "industry_match"], label: "Industry Match" },
  { keys: ["regional", "region", "regional_experience"], label: "Regional Experience" },
  {
    keys: ["role_seniority", "role_and_seniority", "role_and_seniority_alignment", "seniority", "role"],
    label: "Role and Seniority Alignment",
  },
];
const normKey = (k) => String(k).toLowerCase().replace(/[\s-]+/g, "_");

/** Order the breakdown into the documented signals first (with polished labels),
 *  then any leftover non-meta keys (title-cased) so nothing is lost. */
const orderRubric = (data) => {
  // The signals live under a `signals` wrapper; fall back to the root otherwise.
  const source = isObj(data?.signals) ? data.signals : data;
  const entries = Object.entries(source || {}).filter(([k]) => !RUBRIC_META_KEYS.has(k));
  const used = new Set();
  const rows = [];
  for (const sig of HARD_FILTER_SIGNALS) {
    const hit = entries.find(([k]) => !used.has(k) && sig.keys.includes(normKey(k)));
    if (hit) {
      used.add(hit[0]);
      rows.push({ key: hit[0], label: sig.label, value: hit[1] });
    }
  }
  for (const [k, v] of entries) {
    if (!used.has(k)) rows.push({ key: k, label: titleCase(k), value: v });
  }
  return rows;
};

const RubricRow = ({ label, value }) => {
  const raw = rubricScore(value);
  const weight = isObj(value) ? toScore(value.weight ?? value.max ?? value.max_points ?? value.out_of) : null;
  // The mock shows each signal's weighted point contribution (these sum to the
  // overall CV Score). Fall back to the raw score when there's no weight.
  const score = padScore(raw != null && weight != null ? (raw / 100) * weight : raw);
  const text = rubricText(value);
  // Whatever the score + reason didn't capture, surface it generically.
  let leftover = null;
  if (isObj(value)) {
    const used = consumedKeys(value);
    const rest = Object.fromEntries(Object.entries(value).filter(([k]) => !used.has(k)));
    if (Object.keys(rest).length) leftover = rest;
  } else if (Array.isArray(value) && !text) {
    leftover = value;
  }
  const primitiveOnly = !text && !leftover && score == null;
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: GREEN, flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, color: GREEN, fontSize: "0.725rem" }}>{label}</Typography>
        </Stack>
        {score != null && <Typography sx={{ fontWeight: 700, color: GREEN, flexShrink: 0 }}>{score}</Typography>}
      </Stack>
      {text && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, ml: 2.25, lineHeight: 1.6 }}>
          {text}
        </Typography>
      )}
      {primitiveOnly && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, ml: 2.25, lineHeight: 1.6 }}>
          {leafString(value)}
        </Typography>
      )}
      {leftover && (
        <Box sx={{ ml: 2.25 }}>
          <Tree data={leftover} />
        </Box>
      )}
    </Box>
  );
};

const RubricBreakdown = ({ data }) => {
  const rows = orderRubric(data);
  if (!rows.length)
    return (
      <Typography variant="caption" color="text.disabled">
        No breakdown details.
      </Typography>
    );
  return (
    <Stack spacing={2.5} divider={<Divider sx={{ borderColor: CARD_BORDER }} />}>
      {rows.map((r) => (
        <RubricRow key={r.key} label={r.label} value={r.value} />
      ))}
    </Stack>
  );
};

/* ── Key flags + screening summary (folded into the breakdown drawers) ──────── */

const FlagRow = ({ icon, color, label, tag }) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      alignItems: "center",
      py: 1,
      borderBottom: "1px solid",
      borderColor: "action.hover",
      "&:last-of-type": { border: 0 },
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: `${color}.main`,
        bgcolor: `${color}.light`,
        opacity: 0.95,
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 700, color: `${color}.main` }}>
      {tag}
    </Typography>
  </Stack>
);

/** Build the "key flags at a glance" rows from both breakdowns. */
const buildFlags = (jd, trust) => {
  const flags = [];

  const total = jd?.required_skills_total;
  const matched = jd?.required_skills_matched;
  if (total != null && matched != null) {
    const missing = total - matched;
    if (missing > 0) {
      const critical = matched / total < 0.5;
      flags.push({
        icon: <WarningAmberOutlinedIcon fontSize="small" />,
        color: critical ? "error" : "warning",
        label: `${missing} of ${total} required skills missing from CV`,
        tag: critical ? "Critical" : "Warning",
      });
    }
  }

  const consistency = toScore(trust?.consistency?.score);
  if (consistency != null && consistency < 75) {
    flags.push({
      icon: <AccessTimeOutlinedIcon fontSize="small" />,
      color: consistency < 50 ? "error" : "warning",
      label: asArray(trust?.consistency?.reasons)[0] || "Experience claims may exceed documented history",
      tag: consistency < 50 ? "Critical" : "Warning",
    });
  }

  const markers = trust?.linguistic_genericity?.details?.top_markers;
  const markerCount = trust?.linguistic_genericity?.details?.marker_count;
  if (markerCount > 0 && markers) {
    const terms = Object.keys(markers);
    flags.push({
      icon: <SmartToyOutlinedIcon fontSize="small" />,
      color: "warning",
      label: `${markerCount} AI buzzword${markerCount === 1 ? "" : "s"} detected: ${terms.slice(0, 4).map((t) => `"${t}"`).join(", ")}`,
      tag: "Warning",
    });
  }

  const tc = trust?.timeline_coherence?.details;
  if (tc && tc.total > 0) {
    const untraced = tc.total - tc.matched;
    if (untraced > 0) {
      flags.push({
        icon: <ManageSearchOutlinedIcon fontSize="small" />,
        color: "warning",
        label: `${untraced} of ${tc.total} listed skills can't be traced to a job role`,
        tag: "Warning",
      });
    }
  }

  const specificity = toScore(trust?.specificity?.score);
  if (specificity != null && specificity >= 50) {
    flags.push({
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: "success",
      label: asArray(trust?.specificity?.reasons)[0] || "Names specific clients, projects and outcomes",
      tag: "Good",
    });
  }

  return flags;
};

const KeyFlags = ({ flags }) => (
  <Box sx={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 2, p: 2, bgcolor: CARD_BG }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
      Key flags at a glance
    </Typography>
    {flags.map((f, i) => (
      <FlagRow key={i} {...f} />
    ))}
  </Box>
);

const SummaryRow = ({ icon, label, value, tagColor: tc, tag }) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      alignItems: "center",
      py: 1,
      borderBottom: "1px solid",
      borderColor: "action.hover",
      "&:last-of-type": { border: 0 },
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.5,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        bgcolor: "action.hover",
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
      {label}
    </Typography>
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      {tag && <Chip size="small" label={tag} color={tc} sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontSize: 11 } }} />}
    </Stack>
  </Stack>
);

const ScreeningSummary = ({ jd, trust }) => {
  const total = jd?.required_skills_total;
  const matched = jd?.required_skills_matched;
  const consistency = toScore(trust?.consistency?.score);
  const markerCount = trust?.linguistic_genericity?.details?.marker_count;
  const specificity = toScore(trust?.specificity?.score);
  const passes = jd?.passes_threshold;
  return (
    <Box sx={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 2, p: 2, bgcolor: CARD_BG }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Screening summary
      </Typography>
      {total != null && matched != null && (
        <SummaryRow
          icon={<WorkOutlineIcon fontSize="small" />}
          label="Skills match"
          value={`${matched} of ${total}`}
          tag={matched / Math.max(1, total) < 0.5 ? "Low" : "OK"}
          tagColor={matched / Math.max(1, total) < 0.5 ? "error" : "success"}
        />
      )}
      {consistency != null && (
        <SummaryRow
          icon={<VerifiedUserOutlinedIcon fontSize="small" />}
          label="Experience verification"
          value={consistency < 75 ? "Claim exceeds evidence" : "Consistent"}
          tag={consistency < 75 ? "Review" : "OK"}
          tagColor={consistency < 75 ? "warning" : "success"}
        />
      )}
      {markerCount != null && (
        <SummaryRow
          icon={<SmartToyOutlinedIcon fontSize="small" />}
          label="AI-generated content"
          value={markerCount > 0 ? "Likely" : "Not detected"}
          tag={markerCount > 0 ? "Flagged" : "Clear"}
          tagColor={markerCount > 0 ? "warning" : "success"}
        />
      )}
      {specificity != null && (
        <SummaryRow
          icon={<FactCheckOutlinedIcon fontSize="small" />}
          label="Detail quality"
          value={specificity >= 50 ? "Names clients + projects" : "Sparse / generic"}
          tag={specificity >= 50 ? "OK" : "Low"}
          tagColor={specificity >= 50 ? "success" : "warning"}
        />
      )}
      {passes != null && (
        <SummaryRow
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label="Meets minimum threshold"
          value={passes ? "Yes" : "No"}
          tag={passes ? "Pass" : "Fail"}
          tagColor={passes ? "success" : "error"}
        />
      )}
    </Box>
  );
};

/* ── Data → view-model helpers ─────────────────────────────────────────────── */

const trustSummary = (breakdown) => {
  const weak = TRUST_SIGNALS.map((s) => ({ label: s.label, score: toScore(breakdown?.[s.key]?.score) }))
    .filter((s) => s.score != null && s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
  if (!weak.length) return "All authenticity checks look solid.";
  return `${weak.map((w) => w.label).join(" and ")} flagged for review.`;
};

/** A recruiter-facing concern summary for the CV Authenticity card face: the
 *  actual reason sentences from the weakest sub-signals, falling back to a
 *  generic "which checks are flagged" line. */
const authenticitySummary = (breakdown) => {
  const reasons = TRUST_SIGNALS.map((s) => ({
    score: toScore(breakdown?.[s.key]?.score),
    reasons: asArray(breakdown?.[s.key]?.reasons),
  }))
    .filter((s) => s.score != null && s.score < 75 && s.reasons.length)
    .sort((a, b) => a.score - b.score)
    .flatMap((s) => s.reasons)
    .map((r) => String(r).trim().replace(/\.$/, ""))
    .slice(0, 2);
  if (reasons.length) return `Some concerns: ${reasons.join("; ")}.`;
  return trustSummary(breakdown);
};

/**
 * The Credibility Check card — a recruiter-facing read of an application's
 * headline signals, stacked as rows inside one cream card: CV Authenticity (the
 * `authenticity` verdict + its five sub-signals), the CV Score (the
 * `hard_filter` rubric), a derived Background Validation score, and — once the
 * candidate has been through WhatsApp screening — the Eligibility Questions.
 *
 * Stage-gated per the pipeline levels:
 *  - Profile Match (the `similarity` score) is the L1 headline and is dropped
 *    once the candidate advances to hard_filter (L2), where CV Score leads.
 *  - Background Validation + Eligibility Questions appear at whatsapp (L3),
 *    fed by the derived `screening` view-model from the parent.
 *  - Interview Scoring (HR's manual mark + comment) appears at the interview
 *    stage; the Shortlist verdict appears at the final (done) stage.
 */
const CvScoreCard = ({
  scores,
  stage,
  screening,
  appId,
  interviewFeedback,
  interviewEditable = false,
}) => {
  const trust = findScore(scores, "authenticity");
  const jd = findScore(scores, "similarity");
  const others = asArray(scores).filter(
    (s) => s && s.score_type !== "authenticity" && s.score_type !== "similarity",
  );

  const trustBreak = trust?.breakdown || null;
  const jdBreak = jd?.breakdown || null;
  const trustValue = trust ? toScore(trust.value) : null;
  const jdValue = jd ? toScore(jd.value) : null;
  const flags = buildFlags(jdBreak, trustBreak);

  const stageIdx = APPLICATION_STAGES.indexOf(stage);
  const reachedHardFilter = stageIdx >= APPLICATION_STAGES.indexOf("hard_filter");
  const reachedWhatsApp = stageIdx >= APPLICATION_STAGES.indexOf("whatsapp");
  const reachedInterview = stageIdx >= APPLICATION_STAGES.indexOf("interview");
  const reachedDone = stageIdx >= APPLICATION_STAGES.indexOf("done");
  // Profile Match only ever leads at the initial vector-screen level (L1).
  const showProfileMatch = !!jd && !reachedHardFilter;

  const bgValidation = screening?.bgValidation ?? null;
  const eligibility = asArray(screening?.eligibility);
  const screenedAt = screening?.computedAt || null;

  if (!trust && !jd && !others.length && !reachedWhatsApp) {
    return (
      <Typography variant="body2" color="text.secondary">
        No scores computed yet.
      </Typography>
    );
  }

  const otherLabel = (t) => (t === "hard_filter" ? "CV Score" : humanize(t));
  const hasHardFilter = others.some((s) => s.score_type === "hard_filter");

  return (
    <Box>
      <Eyebrow>Credibility Check</Eyebrow>
      <Box sx={cardSx}>
        {trust && trustValue != null ? (
          <AuthenticityRow
            value={trustValue}
            summary={authenticitySummary(trustBreak)}
            breakdown={trustBreak}
            flags={flags}
          />
        ) : (
          <PendingRow label="CV Authenticity" />
        )}

        {others.map((s, i) => (
          <MeterRow
            key={s.id || `${s.score_type}-${i}`}
            label={otherLabel(s.score_type)}
            value={toScore(s.value)}
            computedAt={s.computed_at}
          >
            {s.breakdown && Object.keys(s.breakdown).length > 0 ? <RubricBreakdown data={s.breakdown} /> : null}
          </MeterRow>
        ))}

        {/* Reached hard filter but the CV Score hasn't landed yet — show it as
            pending rather than leaving a gap (Profile Match is already gone). */}
        {reachedHardFilter && !hasHardFilter && <PendingRow label="CV Score" />}

        {showProfileMatch && (
          <MeterRow label="Profile Match" value={jdValue} computedAt={jd.computed_at}>
            {jdBreak && <JdBreakdown b={jdBreak} />}
            <ScreeningSummary jd={jdBreak} trust={trustBreak} />
          </MeterRow>
        )}

        {/* Derived client-side from the AI-scored answers; hidden until any exist. */}
        {bgValidation != null && (
          <MeterRow label="Background Validation" value={bgValidation} showFooter={false} />
        )}

        {reachedWhatsApp && eligibility.length > 0 && (
          <EligibilityRow items={eligibility} computedAt={screenedAt} />
        )}

        {/* HR's manual interview mark + comment (keyed by appId so the form
            state resets when the dialog switches candidates). */}
        {reachedInterview && (
          <InterviewScoringRow
            key={appId}
            appId={appId}
            feedback={interviewFeedback}
            editable={interviewEditable}
          />
        )}

        {reachedDone && <ShortlistRow />}
      </Box>
    </Box>
  );
};

export default CvScoreCard;
