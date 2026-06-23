"use client";

import { useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
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
import { toScore, scoreBand, timeAgo } from "@/lib/kabil/constants";

const asArray = (v) => (Array.isArray(v) ? v : []);
const findScore = (scores, type) => asArray(scores).find((s) => s?.score_type === type);

/** 0–100 → "65" or "37.8" (one decimal only when it isn't whole). */
const fmtPct = (v) => (v == null ? "—" : Number.isInteger(v) ? `${v}` : v.toFixed(1));

/** scoreBand() palette name → a concrete hex from the theme, for SVG/inline use. */
const bandHex = (theme, band) =>
  ({
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  })[band] || theme.palette.text.disabled;

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

/** Circular gauge mirroring the mock's SVG ring. */
const ScoreRing = ({ value, size = 72, stroke = 6 }) => {
  const theme = useTheme();
  const has = value != null;
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const pct = has ? Math.min(100, Math.max(0, value)) : 0;
  const color = has ? bandHex(theme, scoreBand(value).color) : theme.palette.text.disabled;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.divider} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size > 56 ? 20 : 16,
          fontWeight: 700,
          color,
        }}
      >
        {fmtPct(has ? Math.round(value) : null)}
      </Box>
    </Box>
  );
};

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

/** Shared card chrome: ring + label + summary, with an expandable breakdown. */
const ScoreCard = ({ value, label, summary, computedAt, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", p: 2.5 }}>
        <ScoreRing value={value} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
            {summary}
          </Typography>
        </Box>
      </Stack>
      {children && (
        <>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider />
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2}>{children}</Stack>
              {computedAt && (
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2 }}>
                  Computed {timeAgo(computedAt)}
                </Typography>
              )}
            </Box>
          </Collapse>
          <Button
            fullWidth
            onClick={() => setOpen((o) => !o)}
            endIcon={<ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
              py: 1,
              color: "text.secondary",
              fontWeight: 500,
              bgcolor: "action.hover",
            }}
          >
            {open ? "Hide breakdown" : "View breakdown"}
          </Button>
        </>
      )}
    </Box>
  );
};

/** Empty placeholder when a score family hasn't been computed yet. */
const PendingCard = ({ label }) => (
  <Box
    sx={{
      border: "1px dashed",
      borderColor: "divider",
      borderRadius: 2,
      p: 2.5,
      display: "flex",
      alignItems: "center",
      gap: 2,
      bgcolor: "background.paper",
    }}
  >
    <ScoreRing value={null} />
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Not computed yet.
      </Typography>
    </Box>
  </Box>
);

/** CV Trust verdict bands — score → recruiter-facing badge. */
const TRUST_BADGES = [
  { min: 75, emoji: "🟢", label: "Authentic", color: "success" },
  { min: 50, emoji: "🟡", label: "Review", color: "warning" },
  { min: 0, emoji: "🔴", label: "Likely Fabricated", color: "error" },
];

const trustBadge = (value) => TRUST_BADGES.find((b) => value >= b.min) || TRUST_BADGES[2];

/** CV Trust is shown as a verdict banner (no numeric score) with an expandable
 *  signal breakdown. */
const TrustBanner = ({ value, summary, breakdown }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const badge = trustBadge(value);
  const { color } = badge;
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: `${color}.main`,
        bgcolor: alpha(theme.palette[color].main, 0.08),
        overflow: "hidden",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2 }}>
        <Box sx={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{badge.emoji}</Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              CV Trust Score
            </Typography>
            <Chip
              size="small"
              color={color}
              label={badge.label}
              sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontSize: 11, fontWeight: 700 } }}
            />
          </Stack>
          {summary && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
              {summary}
            </Typography>
          )}
        </Box>
      </Stack>
      {breakdown && (
        <>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ borderColor: alpha(theme.palette[color].main, 0.25) }} />
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <TrustBreakdown breakdown={breakdown} />
              </Stack>
            </Box>
          </Collapse>
          <Button
            fullWidth
            onClick={() => setOpen((o) => !o)}
            endIcon={<ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />}
            sx={{
              borderTop: "1px solid",
              borderColor: alpha(theme.palette[color].main, 0.25),
              borderRadius: 0,
              py: 1,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {open ? "Hide breakdown" : "View breakdown"}
          </Button>
        </>
      )}
    </Box>
  );
};

/* ── Data → view-model helpers ─────────────────────────────────────────────── */

const jdSummary = (b) => {
  const total = b?.required_skills_total;
  const matched = b?.required_skills_matched;
  if (total == null || matched == null) return "Awaiting the skills breakdown.";
  const gaps = total - matched;
  const head = `${matched} of ${total} required skill${total === 1 ? "" : "s"} found.`;
  return gaps > 0 ? `${head} ${gaps} skill gap${gaps === 1 ? "" : "s"} identified.` : `${head} No gaps.`;
};

const trustSummary = (breakdown) => {
  const weak = TRUST_SIGNALS.map((s) => ({ label: s.label, score: toScore(breakdown?.[s.key]?.score) }))
    .filter((s) => s.score != null && s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
  if (!weak.length) return "All authenticity checks look solid.";
  return `${weak.map((w) => w.label).join(" and ")} flagged for review.`;
};

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

const FlagRow = ({ icon, color, label, tag }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1, borderBottom: "1px solid", borderColor: "action.hover", "&:last-of-type": { border: 0 } }}>
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

/* ── Detailed-view breakdown bodies ────────────────────────────────────────── */

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

/* ── Screening-summary bar (detailed view footer) ──────────────────────────── */

const SummaryRow = ({ icon, label, value, tagColor: tc, tag }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1, borderBottom: "1px solid", borderColor: "action.hover", "&:last-of-type": { border: 0 } }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", bgcolor: "action.hover" }}>
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
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, bgcolor: "background.paper" }}>
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

/**
 * The CV Score Card — a recruiter-facing read of an application's two headline
 * scores: JD Match (the `similarity` score's skill breakdown) and CV Trust (the
 * `authenticity` score's five sub-signals). Everything is shown at once: the two
 * headline score cards (each with an expandable "View breakdown" for its
 * sub-signals), the key flags at a glance, and the screening summary.
 */
const CvScoreCard = ({ scores }) => {
  const jd = findScore(scores, "similarity");
  const trust = findScore(scores, "authenticity");
  const jdValue = jd ? toScore(jd.value) : null;
  const trustValue = trust ? toScore(trust.value) : null;
  const jdBreak = jd?.breakdown || null;
  const trustBreak = trust?.breakdown || null;

  if (!jd && !trust) {
    return (
      <Typography variant="body2" color="text.secondary">
        No scores computed yet.
      </Typography>
    );
  }

  const flags = buildFlags(jdBreak, trustBreak);

  return (
    <Box>
      <Stack spacing={2}>
        {trust && trustValue != null ? (
          <TrustBanner value={trustValue} summary={trustSummary(trustBreak)} breakdown={trustBreak} />
        ) : (
          <PendingCard label="CV Trust Score" />
        )}

        {jd ? (
          <ScoreCard value={jdValue} label="JD Outcome" summary={jdSummary(jdBreak)} computedAt={jd.computed_at}>
            {jdBreak && <JdBreakdown b={jdBreak} />}
          </ScoreCard>
        ) : (
          <PendingCard label="JD Outcome" />
        )}

        {flags.length > 0 && (
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, bgcolor: "background.paper" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Key flags at a glance
            </Typography>
            {flags.map((f, i) => (
              <FlagRow key={i} {...f} />
            ))}
          </Box>
        )}

        <ScreeningSummary jd={jdBreak} trust={trustBreak} />
      </Stack>
    </Box>
  );
};

export default CvScoreCard;
