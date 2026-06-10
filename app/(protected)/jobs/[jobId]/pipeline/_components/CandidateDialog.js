"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorAlert from "@/components/ErrorAlert";
import WhatsAppDialog from "./WhatsAppDialog";
import {
  useApplication,
  useAuditLog,
  useUpdateStage,
  useUpdateStatus,
  useAddToPool,
} from "@/lib/kabil/queries";
import {
  APPLICATION_STAGES,
  NEXT_STAGE,
  humanize,
  statusColor,
  bandColor,
  authenticityLabel,
  scoreBand,
  toScore,
  timeAgo,
} from "@/lib/kabil/constants";

const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const asArray = (v) => (Array.isArray(v) ? v : []);
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const scoreColor = (v) => scoreBand(v).color;

/** One labelled value row. */
const Field = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {children ?? "—"}
    </Typography>
  </Box>
);

/** A titled block inside the dialog. */
const Section = ({ title, action, children }) => (
  <Box>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Box>
);

/** A single leaf value: scalar, boolean, or array (as wrapping chips). */
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
        sx={{ height: 20 }}
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
            sx={{ height: 20, maxWidth: "100%" }}
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

/**
 * Recursively renders a breakdown. Nested objects indent under a heading (so
 * the value area always stays wide); leaves are label + value rows that wrap.
 */
const BreakdownNode = ({ label, value, depth }) => {
  if (isPlainObject(value)) {
    return (
      <Box
        sx={
          depth > 0
            ? { pl: 1.5, borderLeft: "2px solid", borderColor: "#eef0ef" }
            : undefined
        }
      >
        {label && (
          <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
            {humanize(label)}
          </Typography>
        )}
        <Stack spacing={0.75}>
          {Object.entries(value).map(([k, v]) => (
            <BreakdownNode key={k} label={k} value={v} depth={depth + 1} />
          ))}
        </Stack>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "baseline" }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>
        {humanize(label)}
      </Typography>
      <Box sx={{ flex: "1 1 280px", minWidth: 0 }}>
        <LeafValue value={value} />
      </Box>
    </Box>
  );
};

const Breakdown = ({ data }) => {
  const entries = Object.entries(data || {});
  if (!entries.length) return null;
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {entries.map(([key, value]) => (
        <BreakdownNode key={key} label={key} value={value} depth={0} />
      ))}
    </Stack>
  );
};

/** Structured CV from `candidate.parsed_profile` (shape is loose — render defensively). */
const ParsedProfile = ({ profile }) => {
  const p = profile || {};
  const skills = asArray(p.skills);
  const work = asArray(p.work_history);
  const education = asArray(p.education);
  const languages = asArray(p.languages);
  const years = p.total_experience_years;

  if (!Object.keys(p).length) {
    return (
      <Typography variant="body2" color="text.secondary">
        CV is still being parsed — details will appear once processing completes.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {years != null && <Field label="Total experience">{`${years} year${years === 1 ? "" : "s"}`}</Field>}

      {skills.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {skills.map((s, i) => (
              <Chip
                key={`${s}-${i}`}
                size="small"
                variant="outlined"
                label={String(s)}
                sx={{ maxWidth: "100%" }}
              />
            ))}
          </Box>
        </Box>
      )}

      {languages.length > 0 && (
        <Field label="Languages">
          {languages.map((l) => (typeof l === "object" ? l.name || JSON.stringify(l) : l)).join(", ")}
        </Field>
      )}

      {work.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
            Work history
          </Typography>
          <Stack spacing={1}>
            {work.map((w, i) => (
              <Box key={i} sx={{ border: "1px solid #eef0ef", borderRadius: 1.5, p: 1.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {w.title || w.role || "Role"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {[w.company, [w.start_date || w.start, w.end_date || w.end].filter(Boolean).join(" – ")]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
                {w.summary && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {w.summary}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {education.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
            Education
          </Typography>
          <Stack spacing={0.5}>
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

const DialogSkeleton = () => (
  <Stack spacing={2}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={26} />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Stack>
    <Skeleton variant="rounded" height={80} />
    <Skeleton variant="rounded" height={120} />
    <Skeleton variant="rounded" height={160} />
  </Stack>
);

/**
 * Modal with the full application + candidate record and pipeline actions.
 * Pass `readOnly` (e.g. when viewing a pooled candidate) to hide the pipeline
 * controls — "Add to talent pool", WhatsApp chat, and the stage/reject section —
 * leaving a clean profile view.
 */
const CandidateDialog = ({ appId, open, onClose, readOnly = false }) => {
  const [reason, setReason] = useState("");
  const [waOpen, setWaOpen] = useState(false);
  const { data: app, isLoading, isError, error } = useApplication(appId, { poll: true });
  const { data: audit } = useAuditLog(appId);
  const updateStage = useUpdateStage(appId);
  const updateStatus = useUpdateStatus(appId);
  const addToPool = useAddToPool();
  const resetAddToPool = addToPool.reset;

  // Clear the "added to pool" state when the dialog switches candidates, since
  // this component stays mounted across openings. `reset` is stable in RQ.
  useEffect(() => {
    resetAddToPool();
  }, [appId, resetAddToPool]);

  const busy = updateStage.isPending || updateStatus.isPending;
  const nextStage = app ? NEXT_STAGE[app.stage] : null;
  const isActive = app?.status === "active";
  // The WhatsApp screening transcript exists once a candidate reaches L2
  // (the `whatsapp` stage) and stays relevant through later stages.
  const reachedWhatsApp =
    !!app && APPLICATION_STAGES.indexOf(app.stage) >= APPLICATION_STAGES.indexOf("whatsapp");

  const advance = () => {
    if (!nextStage) return;
    updateStage.mutate({ stage: nextStage, reason: reason.trim() || undefined });
    setReason("");
  };
  const setStatus = (status) => {
    updateStatus.mutate({ status, reason: reason.trim() || undefined });
    setReason("");
  };

  const candidate = app?.candidate;
  const pooled = addToPool.isSuccess;
  const addToPoolNow = () => {
    if (!candidate?.id) return;
    addToPool.mutate({ candidateId: candidate.id, sourceJobId: app?.job_id });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close"
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, color: "text.secondary" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {isError ? (
          <ErrorAlert error={error} sx={{ mt: 2 }} />
        ) : isLoading || !app ? (
          <DialogSkeleton />
        ) : (
          <Stack spacing={2.5} divider={<Divider flexItem />}>
            {/* Header */}
            <Box sx={{ pr: 4 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
                  {initials(candidate?.full_name)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {candidate?.full_name}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
                    <Chip size="small" label={humanize(app.stage)} color="primary" variant="outlined" />
                    <Chip size="small" label={humanize(app.status)} color={statusColor(app.status)} />
                    {candidate?.authenticity_band && (
                      <Chip
                        size="small"
                        label={authenticityLabel(candidate.authenticity_band)}
                        color={bandColor(candidate.authenticity_band)}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 3,
                  rowGap: 0.5,
                  mt: 1.75,
                  color: "text.secondary",
                }}
              >
                {candidate?.email && (
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <EmailOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{candidate.email}</Typography>
                  </Stack>
                )}
                {candidate?.phone_e164 && (
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{candidate.phone_e164}</Typography>
                  </Stack>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                Applied {timeAgo(app.created_at)} · stage updated {timeAgo(app.stage_updated_at)}
              </Typography>

              {!readOnly && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, mt: 1.5 }}>
                <Button
                  variant={pooled ? "contained" : "outlined"}
                  size="small"
                  color={pooled ? "success" : "secondary"}
                  startIcon={pooled ? <CheckCircleOutlineIcon /> : <PersonAddAltOutlinedIcon />}
                  onClick={addToPoolNow}
                  disabled={addToPool.isPending || pooled || !candidate?.id}
                >
                  {pooled
                    ? "In talent pool"
                    : addToPool.isPending
                      ? "Adding…"
                      : "Add to talent pool"}
                </Button>
                {reachedWhatsApp && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => setWaOpen(true)}
                  >
                    WhatsApp chat
                  </Button>
                )}
              </Stack>
              )}
              {!readOnly && addToPool.isError && <ErrorAlert error={addToPool.error} sx={{ mt: 1 }} />}
            </Box>

            {/* Actions */}
            {!readOnly && (
            <Section title="Move candidate">
              {app.rejection_reason && (
                <Typography variant="body2" color="error.main" sx={{ mb: 1.5 }}>
                  {app.rejection_reason}
                </Typography>
              )}
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Reason (optional, recorded in audit log)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                inputProps={{ maxLength: 500 }}
                disabled={busy}
                sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {isActive && nextStage && (
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={advance}
                    disabled={busy}
                  >
                    Advance to {humanize(nextStage)}
                  </Button>
                )}
                {isActive && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={() => setStatus("rejected")}
                    disabled={busy}
                  >
                    Reject
                  </Button>
                )}
                {app.status === "rejected" && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReplayIcon />}
                    onClick={() => setStatus("active")}
                    disabled={busy}
                  >
                    Reactivate
                  </Button>
                )}
              </Box>
              {(updateStage.isError || updateStatus.isError) && (
                <ErrorAlert error={updateStage.error || updateStatus.error} sx={{ mt: 1.5 }} />
              )}
            </Section>
            )}

            {/* Scores */}
            <Section title="Scores">
              <Stack spacing={2}>
                {asArray(app.scores).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No scores computed yet.
                  </Typography>
                )}
                {asArray(app.scores).map((s, i) => {
                  const value = toScore(s.value);
                  return (
                  <Box key={s.id || `${s.score_type}-${i}`}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {humanize(s.score_type)}
                      </Typography>
                      <Chip
                        size="small"
                        label={value != null ? `${Math.round(value)}` : "—"}
                        color={scoreColor(s.value)}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={value != null ? Math.min(100, Math.max(0, value)) : 0}
                      color={scoreColor(s.value)}
                      sx={{ mt: 0.75, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {timeAgo(s.computed_at)}
                    </Typography>
                    {s.breakdown && Object.keys(s.breakdown).length > 0 && (
                      <Accordion
                        disableGutters
                        elevation={0}
                        square
                        sx={{ mt: 0.5, bgcolor: "transparent", "&:before": { display: "none" } }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon fontSize="small" />}
                          sx={{
                            px: 0,
                            minHeight: 0,
                            bgcolor: "transparent",
                            "&.Mui-focusVisible": { bgcolor: "transparent" },
                            "& .MuiAccordionSummary-content": { my: 0.5 },
                          }}
                        >
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                            Breakdown
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0, pb: 0 }}>
                          <Breakdown data={s.breakdown} />
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                  );
                })}
              </Stack>
            </Section>

            {/* Profile */}
            <Section title="Candidate profile">
              <ParsedProfile profile={candidate?.parsed_profile} />
            </Section>

            {/* CV document */}
            {app.cv_document?.blob_url && (
              <Section title="CV document">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  component="a"
                  href={app.cv_document.blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open CV
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                  Uploaded {timeAgo(app.cv_document.uploaded_at)}
                  {app.cv_document.language ? ` · ${app.cv_document.language.toUpperCase()}` : ""}
                </Typography>
              </Section>
            )}

            {/* Audit log */}
            <Section title="Activity">
              {asArray(audit?.items).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No activity recorded yet.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {asArray(audit?.items).map((entry) => (
                    <Stack key={entry.id} direction="row" spacing={1.25}>
                      <HistoryOutlinedIcon sx={{ fontSize: 18, color: "text.disabled", mt: 0.25 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {humanize(entry.action)}
                        </Typography>
                        {entry.after_state?.reason && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {String(entry.after_state.reason)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled">
                          {timeAgo(entry.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Section>
          </Stack>
        )}
      </DialogContent>

      <WhatsAppDialog
        appId={appId}
        candidate={candidate}
        open={waOpen}
        onClose={() => setWaOpen(false)}
      />
    </Dialog>
  );
};

export default CandidateDialog;
