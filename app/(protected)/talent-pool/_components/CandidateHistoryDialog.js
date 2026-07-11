"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ErrorAlert from "@/components/ErrorAlert";
import CvScoreCard from "@/app/(protected)/jobs/[jobId]/pipeline/_components/CvScoreCard";
import { useCandidateHistory } from "@/lib/kabil/queries";
import { stageLabel, statusLabel } from "@/lib/kabil/constants";
import { COLORS } from "@/lib/theme";

/** Brand green — mirrors the candidate dialog chrome so both dialogs read identically. */
const GREEN = "#0F6E56";
/** Shared card surface (identical to CvScoreCard's `cardSx`). */
const CARD_BORDER = "#ECE5D6";
const cardSx = {
  bgcolor: "#F4F0E84D",
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: "14px",
  overflow: "hidden",
};

const initials = (name) =>
  (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const asArray = (v) => (Array.isArray(v) ? v : []);

/** "January 2026" — the month a stint was moved back to the pool. */
const monthYear = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(d);
};

/** Section heading — matches the candidate dialog's "Move candidate" label scale. */
const sectionTitleSx = (color) => ({
  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
  fontWeight: 700,
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "0.2px",
  color,
});

/* ── Recent activity: one row per move-to-pool, with an inline "View Reason" ── */

const ActivityRow = ({ stint, isLast }) => {
  const [open, setOpen] = useState(false);
  const reason = stint.move_to_pool_reason;
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: isLast ? "none" : `1px solid ${CARD_BORDER}`,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: COLORS.gold,
            mt: "5px",
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: "#2C2C2A", fontWeight: 500 }}>
            Moved from {stint.job_title || "a job"} to Talent Pool at {stageLabel(stint.stage)}.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {monthYear(stint.archived_at) || monthYear(stint.stage_updated_at)}
          </Typography>
        </Box>
        <Button
          onClick={() => setOpen((o) => !o)}
          disableRipple
          size="small"
          sx={{
            color: GREEN,
            fontWeight: 700,
            textTransform: "none",
            minWidth: 0,
            p: 0,
            flexShrink: 0,
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          {open ? "Hide Reason" : "View Reason"}
        </Button>
      </Stack>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Typography
          variant="body2"
          sx={{ mt: 1, ml: 3.25, color: reason ? "#2C2C2A" : "text.disabled", whiteSpace: "pre-wrap" }}
        >
          {reason || "No reason was recorded for this move."}
        </Typography>
      </Collapse>
    </Box>
  );
};

const HistorySkeleton = () => (
  <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={24} width="40%" />
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={120} />
    </Stack>
  </Box>
);

/**
 * Talent-pool candidate history. Mirrors the pipeline candidate dialog's exact
 * chrome (green banner + "CANDIDATE SCORING" eyebrow + the same CvScoreCard),
 * scoped to a pooled candidate:
 *   - the scoring card shows the candidate's most recent job's scores,
 *   - "Recent Activity" lists every move back to the pool (with each move's
 *     reason behind "View Reason"),
 *   - "Recruiter Comments" surfaces the reason the candidate was most recently
 *     moved to the pool.
 * Opened from a pool row's "History" action.
 */
const CandidateHistoryDialog = ({ candidateId, open, onClose }) => {
  const { data, isLoading, isError, error } = useCandidateHistory(candidateId, { enabled: open });
  const candidate = data?.candidate;
  const stints = asArray(data?.stints);
  // Newest-first from the API. The most recent job drives the scoring card; the
  // most recent move-to-pool drives the header subtitle + recruiter comment.
  const recentStint = stints[0] || null;
  const moves = stints.filter((s) => s.status === "archived");
  const recentMove = moves[0] || null;

  const subtitle = recentMove
    ? `Moved To Talent Pool From ${stageLabel(recentMove.stage)}`
    : recentStint
      ? `${statusLabel(recentStint.status)} · ${stageLabel(recentStint.stage)}`
      : "In Talent Pool";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      slotProps={{ paper: { sx: { borderRadius: "5px" } } }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close"
        sx={{ position: "absolute", top: 10, right: 10, zIndex: 2, color: "#fff" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          p: 0,
          // Uniform shrink of secondary text + controls — identical to the
          // pipeline candidate dialog so the shared CvScoreCard renders 1:1.
          "& .MuiTypography-body2": { fontSize: "0.72rem" },
          "& .MuiTypography-caption": { fontSize: "0.66rem" },
          "& .MuiTypography-overline": { fontSize: "0.6rem" },
          "& .MuiTypography-subtitle2": { fontSize: "0.75rem" },
          "& .MuiButton-root": { fontSize: "0.72rem" },
          "& .MuiChip-root": { fontSize: "0.66rem" },
          "& .MuiOutlinedInput-input": { fontSize: "0.655rem" },
          "& .MuiFormLabel-root": { fontSize: "0.655rem" },
        }}
      >
        {isError ? (
          <Box sx={{ p: 3 }}>
            <ErrorAlert error={error} />
          </Box>
        ) : isLoading || !data ? (
          <HistorySkeleton />
        ) : (
          <Box>
            {/* Header banner — same styling as the pipeline candidate dialog. */}
            <Box sx={{ bgcolor: GREEN, color: "#fff", px: { xs: 2, sm: 3 }, py: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", pr: 4 }}>
                <Avatar
                  sx={{ width: 42, height: 42, bgcolor: COLORS.gold, color: "#fff", fontWeight: 700, fontSize: 11 }}
                >
                  {initials(candidate?.full_name)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: "22.5px",
                      color: "#FFFFFF",
                    }}
                  >
                    {candidate?.full_name || "Candidate"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: "10px",
                      lineHeight: "15px",
                      letterSpacing: "1px",
                      textTransform: "capitalize",
                      color: "#FFFFFF",
                    }}
                  >
                    {subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Body */}
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 1.75 }}>
              {/* Eyebrow + email — same styling as the candidate dialog. */}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    lineHeight: "15px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: GREEN,
                  }}
                >
                  Candidate Scoring
                </Typography>
                {candidate?.email && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.5 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: GREEN }} />
                    <Typography variant="body2" sx={{ color: GREEN, wordBreak: "break-all" }}>
                      {candidate.email}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Scoring from the most recent job — the shared CvScoreCard. */}
              <Box sx={{ mt: 2 }}>
                {recentStint ? (
                  <CvScoreCard historyMode scores={recentStint.scores} stage={recentStint.stage} />
                ) : (
                  <Box sx={cardSx}>
                    <Box sx={{ px: 2, py: 1.75 }}>
                      <Typography variant="body2" color="text.secondary">
                        This candidate hasn’t been part of any job yet.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Recent activity — every move back to the pool. */}
              {moves.length > 0 && (
                <Box sx={{ mt: 3, mb: 1 }}>
                  <Typography sx={{ ...sectionTitleSx("#2C2C2A"), mb: 1 }}>Recent Activity</Typography>
                  <Box sx={cardSx}>
                    {moves.map((stint, i) => (
                      <ActivityRow
                        key={stint.application_id}
                        stint={stint}
                        isLast={i === moves.length - 1}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateHistoryDialog;
