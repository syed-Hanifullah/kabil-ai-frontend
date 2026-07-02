"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ErrorAlert from "@/components/ErrorAlert";
import CandidateDialog from "../../jobs/[jobId]/pipeline/_components/CandidateDialog";
import { useJobs, useSourceToJob } from "@/lib/kabil/queries";
import { jobStatusColor, humanize } from "@/lib/kabil/constants";

/** Jobs a candidate can be opened against: live or being prepared. */
const SOURCEABLE_STATUSES = ["open", "draft"];

const firstName = (name) => (name || "").split(/\s+/).filter(Boolean)[0] || "this candidate";

/**
 * Opens a pooled candidate's full profile by reusing the pipeline's
 * CandidateDialog. The pool only stores a snapshot, so the rich record (parsed
 * CV, scores, authenticity, CV file) only exists on an *application*. We obtain
 * one via the idempotent `/talent-pool/source` endpoint:
 *
 *  - Entries that came from a job (`source_job_id`) already have an application —
 *    we auto-source to that job, which returns the existing one (`already_existed`),
 *    and open the dialog straight away.
 *  - Entries uploaded straight to the pool have no application yet, so we ask for
 *    a job; sourcing then creates the application that produces the parsed profile.
 */
const ViewCandidateDialog = ({ entry, open, onClose }) => {
  const candidate = entry?.candidate;
  const sourceJobId = entry?.source_job_id || "";
  const [jobId, setJobId] = useState("");
  const [appId, setAppId] = useState(null);

  const source = useSourceToJob();
  const { mutate: sourceMutate, reset: sourceReset } = source;
  const jobsQuery = useJobs({ pageSize: 100 });

  const resolve = (targetJobId) => {
    if (!candidate?.id || !targetJobId) return;
    sourceMutate(
      { candidateId: candidate.id, jobId: targetJobId },
      { onSuccess: (res) => setAppId(res.application_id) },
    );
  };

  // Candidates collected from a job already have a scored application — resolve
  // it on open so the click lands straight on the full profile.
  useEffect(() => {
    if (open && sourceJobId && !appId && !source.isPending && !source.isError) {
      resolve(sourceJobId);
    }
    // Intentionally narrow deps: fire once per open, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceJobId]);

  const handleClose = () => {
    setJobId("");
    setAppId(null);
    sourceReset();
    onClose();
  };

  // Once we have an application, hand off entirely to the pipeline dialog.
  if (appId) {
    return <CandidateDialog appId={appId} open={open} onClose={handleClose} readOnly />;
  }

  const jobs = (jobsQuery.data?.items ?? []).filter((j) =>
    SOURCEABLE_STATUSES.includes(j.status),
  );
  const effectiveJob = jobId || sourceJobId;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        View candidate
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {candidate?.full_name || "Candidate"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {source.isPending ? (
          <Stack spacing={1.5} sx={{ alignItems: "center", py: 3 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading full profile…
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              The pool keeps only a snapshot. Pick a job to open {firstName(candidate?.full_name)}
              ’s full profile — parsed CV, scores and authenticity.
            </Typography>
            <TextField
              select
              fullWidth
              label="Job"
              value={effectiveJob}
              onChange={(e) => setJobId(e.target.value)}
              disabled={jobsQuery.isLoading || jobs.length === 0}
              helperText={
                jobsQuery.isLoading
                  ? "Loading jobs…"
                  : jobs.length === 0
                    ? "No open or draft jobs to open this candidate against."
                    : "Open and draft jobs are valid targets."
              }
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
            >
              <MenuItem value="" disabled>
                Select a job…
              </MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", justifyContent: "space-between", width: "100%" }}
                  >
                    <Box component="span" sx={{ minWidth: 0 }}>
                      {job.title}
                      {job.hiring_company ? ` — ${job.hiring_company}` : ""}
                    </Box>
                    <Chip
                      size="small"
                      label={humanize(job.status)}
                      color={jobStatusColor(job.status)}
                      sx={{ height: 20, flexShrink: 0 }}
                    />
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            {source.isError && <ErrorAlert error={source.error} />}
            {jobsQuery.isError && <ErrorAlert error={jobsQuery.error} />}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => resolve(effectiveJob)}
          disabled={!effectiveJob || source.isPending}
          startIcon={<VisibilityOutlinedIcon />}
        >
          View profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCandidateDialog;
