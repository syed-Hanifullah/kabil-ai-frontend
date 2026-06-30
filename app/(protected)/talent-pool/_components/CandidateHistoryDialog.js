"use client";

import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import { useCandidateHistory } from "@/lib/kabil/queries";
import {
  humanize,
  stageLabel,
  statusColor,
  statusLabel,
  bandColor,
  authenticityLabel,
  scoreBand,
  toScore,
  whatsappStateLabel,
  timeAgo,
} from "@/lib/kabil/constants";

const initials = (name) =>
  (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "🧑";

const asArray = (v) => (Array.isArray(v) ? v : []);
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/** Absolute timestamp for a tooltip, e.g. "Jun 14, 2026, 7:04 PM". */
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/** Relative time with the absolute datetime on hover. */
const When = ({ iso, prefix = "" }) => (
  <Tooltip title={fmtDate(iso)}>
    <Box component="span">
      {prefix}
      {timeAgo(iso)}
    </Box>
  </Tooltip>
);

/* ── Score breakdown (recursive) ──────────────────────────────────────────── */

const LeafValue = ({ value }) => {
  if (value == null || value === "") {
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  }
  if (typeof value === "boolean") {
    return (
      <Chip
        size="small"
        variant="outlined"
        color={value ? "success" : "default"}
        label={value ? "Yes" : "No"}
        sx={{ height: 18 }}
      />
    );
  }
  if (Array.isArray(value)) {
    if (!value.length) {
      return (
        <Typography variant="caption" color="text.disabled">
          None
        </Typography>
      );
    }
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {value.map((v, i) => (
          <Chip
            key={i}
            size="small"
            variant="outlined"
            label={typeof v === "object" ? JSON.stringify(v) : String(v)}
            sx={{ height: 18, maxWidth: "100%" }}
          />
        ))}
      </Box>
    );
  }
  return (
    <Typography variant="caption" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {String(value)}
    </Typography>
  );
};

const BreakdownNode = ({ label, value, depth }) => {
  if (isPlainObject(value)) {
    return (
      <Box sx={depth > 0 ? { pl: 1.25, borderLeft: "2px solid #eef0ef" } : undefined}>
        {label && (
          <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
            {humanize(label)}
          </Typography>
        )}
        <Stack spacing={0.5}>
          {Object.entries(value).map(([k, v]) => (
            <BreakdownNode key={k} label={k} value={v} depth={depth + 1} />
          ))}
        </Stack>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", alignItems: "baseline" }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, flexShrink: 0 }}>
        {humanize(label)}
      </Typography>
      <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
        <LeafValue value={value} />
      </Box>
    </Box>
  );
};

const Breakdown = ({ data }) => {
  const entries = Object.entries(data || {});
  if (!entries.length) return null;
  return (
    <Stack spacing={0.75} sx={{ mt: 0.75 }}>
      {entries.map(([k, v]) => (
        <BreakdownNode key={k} label={k} value={v} depth={0} />
      ))}
    </Stack>
  );
};

/** Every score row for a stint (similarity, CV fit, …) with provenance + breakdown. */
const ScoreDetails = ({ scores }) => {
  const rows = asArray(scores);
  if (!rows.length) {
    return (
      <Typography variant="caption" color="text.secondary">
        No scores computed for this stint yet.
      </Typography>
    );
  }
  return (
    <Stack spacing={1.5}>
      {rows.map((s, i) => {
        const n = toScore(s.value);
        const band = scoreBand(s.value);
        return (
          <Box key={s.id || `${s.score_type}-${i}`}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {humanize(s.score_type)}
              </Typography>
              <Chip size="small" label={s.value ?? "—"} color={band.color} sx={{ fontWeight: 700, height: 22 }} />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={n != null ? Math.min(100, Math.max(0, n)) : 0}
              color={band.color}
              sx={{ mt: 0.5, height: 5, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
              {[s.model_used, s.prompt_version && s.prompt_version !== "-" ? s.prompt_version : null]
                .filter(Boolean)
                .join(" · ")}
              {s.model_used || (s.prompt_version && s.prompt_version !== "-") ? " · " : ""}
              <When iso={s.computed_at} />
            </Typography>
            {isPlainObject(s.breakdown) && Object.keys(s.breakdown).length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                <Breakdown data={s.breakdown} />
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

/* ── WhatsApp screening digest ────────────────────────────────────────────── */

const ScreeningBlock = ({ screening }) => {
  const wa = whatsappStateLabel(screening.state);
  const answers = asArray(screening.answers);
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75, flexWrap: "wrap", rowGap: 0.5 }}>
        <WhatsAppIcon sx={{ fontSize: 17, color: "#25D366" }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          WhatsApp screening
        </Typography>
        <Chip size="small" label={wa.label} color={wa.color} sx={{ height: 18 }} />
        <Typography variant="caption" color="text.disabled">
          <When iso={screening.created_at} prefix="started " />
          {screening.closed_at ? <> · <When iso={screening.closed_at} prefix="closed " /></> : null}
        </Typography>
      </Stack>
      {answers.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No answers recorded — the candidate hadn’t replied at this stage.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {answers.map((a, i) => (
            <Box key={a.question_index ?? i} sx={{ border: "1px solid #eef0ef", borderRadius: 1.5, p: 1.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {a.question || `Question ${(a.question_index ?? i) + 1}`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.25, whiteSpace: "pre-wrap" }}>
                {a.answer || "—"}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.5 }}>
                {a.relevance_score != null && (
                  <Tooltip title="How relevant the answer was to the question (0–100)">
                    <Chip size="small" variant="outlined" label={`Relevance ${a.relevance_score}`} sx={{ height: 20 }} />
                  </Tooltip>
                )}
                {a.ai_score != null && (
                  <Tooltip title="Likelihood the answer was AI-generated — higher = more likely (0–100)">
                    <Chip size="small" variant="outlined" label={`AI ${a.ai_score}`} sx={{ height: 20 }} />
                  </Tooltip>
                )}
              </Stack>
              {a.rationale && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {a.rationale}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

/* ── A collapsible sub-section header inside a stint ──────────────────────── */

const StintAccordion = ({ icon, title, badge, children, defaultExpanded = false }) => (
  <Accordion
    disableGutters
    elevation={0}
    square
    defaultExpanded={defaultExpanded}
    sx={{ bgcolor: "transparent", "&:before": { display: "none" } }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />} sx={{ px: 0, minHeight: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {badge}
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, pt: 0 }}>{children}</AccordionDetails>
  </Accordion>
);

/* ── One job the candidate passed through ─────────────────────────────────── */

const StintCard = ({ stint, onClose }) => {
  const archived = stint.status === "archived";
  const scoreCount = asArray(stint.scores).length;
  const answerCount = asArray(stint.screening?.answers).length;
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2, opacity: archived ? 0.9 : 1 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
            <Typography sx={{ fontWeight: 700 }} noWrap>
              {stint.job_title}
            </Typography>
          </Stack>
          <Button
            component={Link}
            href={`/jobs/${stint.job_id}/pipeline`}
            onClick={onClose}
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            sx={{ flexShrink: 0 }}
          >
            Open
          </Button>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
          <Chip size="small" label={stageLabel(stint.stage)} color="primary" variant="outlined" sx={{ height: 22 }} />
          <Chip size="small" label={statusLabel(stint.status)} color={statusColor(stint.status)} sx={{ height: 22 }} />
          {stint.sourced_from_talent_pool && (
            <Chip size="small" label="Sourced from pool" variant="outlined" sx={{ height: 22 }} />
          )}
        </Stack>

        {/* Quick score read-out */}
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Relevancy
            </Typography>
            <Chip
              size="small"
              label={stint.similarity_score ?? "—"}
              color={stint.similarity_score != null ? scoreBand(stint.similarity_score).color : "default"}
              variant={stint.similarity_score != null ? "filled" : "outlined"}
              sx={{ height: 22, fontWeight: 700 }}
            />
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              CV fit
            </Typography>
            <Chip
              size="small"
              label={stint.hard_filter_score ?? "—"}
              color={stint.hard_filter_score != null ? scoreBand(stint.hard_filter_score).color : "default"}
              variant={stint.hard_filter_score != null ? "filled" : "outlined"}
              sx={{ height: 22, fontWeight: 700 }}
            />
          </Stack>
        </Stack>

        {/* Full score breakdowns */}
        {scoreCount > 0 && (
          <>
            <Divider flexItem />
            <StintAccordion
              title="Score details"
              badge={
                <Typography variant="caption" color="text.secondary">
                  {scoreCount} score{scoreCount === 1 ? "" : "s"}
                </Typography>
              }
            >
              <ScoreDetails scores={stint.scores} />
            </StintAccordion>
          </>
        )}

        {/* WhatsApp screening */}
        {stint.screening && (
          <>
            <Divider flexItem />
            <StintAccordion
              icon={<WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} />}
              title="WhatsApp screening"
              badge={
                <Chip
                  size="small"
                  label={whatsappStateLabel(stint.screening.state).label}
                  color={whatsappStateLabel(stint.screening.state).color}
                  sx={{ height: 18 }}
                />
              }
            >
              <ScreeningBlock screening={stint.screening} />
            </StintAccordion>
          </>
        )}

        <Divider flexItem />
        <Typography variant="caption" color="text.disabled">
          <When iso={stint.created_at} prefix="Started " />
          {" · "}
          <When iso={stint.stage_updated_at} prefix="stage updated " />
          {archived && stint.archived_at ? (
            <>
              {" · "}
              <When iso={stint.archived_at} prefix="moved to pool " />
            </>
          ) : null}
        </Typography>
      </Stack>
    </Card>
  );
};

/* ── Candidate CV profile (candidate-level, shown once) ───────────────────── */

const CandidateProfile = ({ profile }) => {
  const p = profile || {};
  const skills = asArray(p.skills);
  const work = asArray(p.work_history);
  const education = asArray(p.education);
  const languages = asArray(p.languages);
  const years = p.total_experience_years;
  if (!Object.keys(p).length) {
    return (
      <Typography variant="caption" color="text.secondary">
        CV not parsed yet for this candidate.
      </Typography>
    );
  }
  return (
    <Stack spacing={1.25}>
      {years != null && (
        <Typography variant="body2">
          <strong>{years}</strong> year{years === 1 ? "" : "s"} total experience
        </Typography>
      )}
      {skills.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {skills.map((s, i) => (
              <Chip key={`${s}-${i}`} size="small" variant="outlined" label={String(s)} sx={{ height: 22 }} />
            ))}
          </Box>
        </Box>
      )}
      {languages.length > 0 && (
        <Typography variant="body2">
          <Box component="span" sx={{ color: "text.secondary" }}>
            Languages:{" "}
          </Box>
          {languages.map((l) => (typeof l === "object" ? l.name || JSON.stringify(l) : l)).join(", ")}
        </Typography>
      )}
      {work.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
            Work history
          </Typography>
          <Stack spacing={0.75}>
            {work.map((w, i) => (
              <Box key={i} sx={{ border: "1px solid #eef0ef", borderRadius: 1.5, p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {w.title || w.role || "Role"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {[w.company, [w.start_date || w.start, w.end_date || w.end].filter(Boolean).join(" – ")]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      {education.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
            Education
          </Typography>
          <Stack spacing={0.25}>
            {education.map((e, i) => (
              <Typography key={i} variant="body2">
                {typeof e === "object"
                  ? [e.degree, e.institution || e.school, e.year].filter(Boolean).join(" · ")
                  : String(e)}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

const HistorySkeleton = () => (
  <Stack spacing={2}>
    <Skeleton variant="rounded" height={70} />
    <Skeleton variant="rounded" height={160} />
    <Skeleton variant="rounded" height={160} />
  </Stack>
);

/**
 * The candidate's full cross-job history — every job they were part of, with
 * each stint's full score breakdowns, model/prompt provenance, WhatsApp
 * screening transcript digest, and timestamps, plus the candidate-level CV
 * profile + authenticity and whether they're currently back in the pool.
 * Opened from a pool row's "History" action.
 */
const CandidateHistoryDialog = ({ candidateId, open, onClose }) => {
  const { data, isLoading, isError, error } = useCandidateHistory(candidateId, { enabled: open });
  const candidate = data?.candidate;
  const stints = asArray(data?.stints);
  const hasProfile = candidate?.parsed_profile && Object.keys(candidate.parsed_profile).length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        Candidate history
        {candidate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {candidate.full_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {isError ? (
          <ErrorAlert error={error} />
        ) : isLoading || !data ? (
          <HistorySkeleton />
        ) : (
          <Stack spacing={2}>
            {/* Candidate header */}
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {initials(candidate?.full_name)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                    {candidate?.authenticity_band && (
                      <Tooltip
                        title={
                          candidate.authenticity_computed_at
                            ? `Authenticity checked ${fmtDate(candidate.authenticity_computed_at)}`
                            : "CV authenticity verdict"
                        }
                      >
                        <Chip
                          size="small"
                          label={authenticityLabel(candidate.authenticity_band)}
                          color={bandColor(candidate.authenticity_band)}
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      </Tooltip>
                    )}
                    {candidate?.authenticity_score != null && (
                      <Typography variant="caption" color="text.secondary">
                        Authenticity {candidate.authenticity_score}
                      </Typography>
                    )}
                    <Chip
                      size="small"
                      label={data.in_pool ? "In pool" : "Not in pool"}
                      color={data.in_pool ? "secondary" : "default"}
                      variant={data.in_pool ? "filled" : "outlined"}
                      sx={{ height: 20 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.25 }}>
                    {candidate?.email && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <EmailOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {candidate.email}
                        </Typography>
                      </Stack>
                    )}
                    {candidate?.phone_e164 && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {candidate.phone_e164}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Candidate CV profile */}
              {hasProfile && (
                <Box sx={{ mt: 1 }}>
                  <StintAccordion
                    title="CV profile"
                    badge={
                      <Typography variant="caption" color="text.secondary">
                        skills · experience · history
                      </Typography>
                    }
                  >
                    <CandidateProfile profile={candidate.parsed_profile} />
                  </StintAccordion>
                </Box>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {data.total_stints} job{data.total_stints === 1 ? "" : "s"} this candidate was part of,
              newest first.
            </Typography>

            {stints.length === 0 ? (
              <EmptyState
                emoji="🗂️"
                title="No job history yet"
                description="This candidate hasn’t been sourced onto any job. Source them to start their pipeline."
              />
            ) : (
              <Stack spacing={1.5}>
                {stints.map((stint) => (
                  <StintCard key={stint.application_id} stint={stint} onClose={onClose} />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateHistoryDialog;
