"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ErrorAlert from "@/components/ErrorAlert";
import UploadDropzone from "./_components/UploadDropzone";
import { useJobs, useBulkUpload } from "@/lib/kabil/queries";
import {
  CV_SOURCES,
  CV_INBOX_STEPS,
  CV_INBOX_HINT,
  BULK_MAX_FILES,
  CV_MAX_MB,
  BULK_REJECTION_LABELS,
  PDPL_CONSENT_LABEL,
  PDPL_CONSENT_TEXT,
} from "@/lib/kabil/constants";
import { COLORS } from "@/lib/theme";

const isPdf = (file) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

/** Coloured pill used in the flow banner. */
const StepChip = ({ step }) => (
  <Chip
    size="small"
    label={`${step.n} ${step.label}`}
    sx={{
      fontWeight: 700,
      color: step.tone === "gold" ? "#11352a" : "#fff",
      bgcolor: step.tone === "gold" ? COLORS.gold : "primary.main",
    }}
  />
);

const FlowBanner = () => (
  <Box
    sx={{
      bgcolor: "rgba(19,64,45,0.06)",
      border: "1px solid rgba(19,64,45,0.12)",
      borderRadius: 2,
      px: 2,
      py: 1.5,
    }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
      {CV_INBOX_STEPS.map((step, i) => (
        <Fragment key={step.n}>
          <StepChip step={step} />
          {i < CV_INBOX_STEPS.length - 1 && (
            <ArrowRightAltIcon sx={{ color: "text.disabled" }} />
          )}
        </Fragment>
      ))}
      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        {CV_INBOX_HINT}
      </Typography>
    </Stack>
  </Box>
);

const FieldLabel = ({ children, required }) => (
  <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600 }}>
    {children}
    {required && (
      <Box component="span" sx={{ color: "error.main" }}>
        {" "}
        *
      </Box>
    )}
  </Typography>
);

/** Loading placeholder mirroring the upload card layout. */
const CvInboxSkeleton = () => (
  <Card>
    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2, mb: 3 }} />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          mb: 3,
        }}
      >
        <Box>
          <Skeleton variant="text" width={80} sx={{ mb: 0.75 }} />
          <Skeleton variant="rounded" height={40} />
        </Box>
        <Box>
          <Skeleton variant="text" width={120} sx={{ mb: 0.75 }} />
          <Skeleton variant="rounded" height={40} />
        </Box>
      </Box>
      <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5, mb: 3 }} />
      <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.5 }} />
    </CardContent>
  </Card>
);

const ResultSummary = ({ result, jobId, onReset }) => {
  const accepted = result.accepted_count ?? result.applications?.length ?? 0;
  const already = result.already_applied ?? [];
  const rejected = result.rejected ?? [];

  return (
    <Alert
      severity={accepted > 0 ? "success" : "warning"}
      action={
        <Button color="inherit" size="small" onClick={onReset}>
          Upload more
        </Button>
      }
    >
      <AlertTitle>
        {accepted > 0
          ? `${accepted} CV${accepted === 1 ? "" : "s"} queued for parsing`
          : "No new CVs were added"}
      </AlertTitle>
      <Stack spacing={0.5}>
        {accepted > 0 && (
          <Typography variant="body2">
            They&apos;ll appear in the job&apos;s Applied column once parsed.{" "}
            <Box
              component={Link}
              href={`/jobs/${jobId}/pipeline`}
              sx={{ fontWeight: 700, color: "inherit" }}
            >
              Open pipeline →
            </Box>
          </Typography>
        )}
        {already.length > 0 && (
          <Typography variant="body2">
            {already.length} candidate{already.length === 1 ? "" : "s"} had already
            applied to this job.
          </Typography>
        )}
        {rejected.length > 0 && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {rejected.length} file{rejected.length === 1 ? "" : "s"} skipped:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {rejected.map((r) => (
                <Typography key={`${r.filename}`} component="li" variant="body2">
                  {r.filename} — {BULK_REJECTION_LABELS[r.reason] ?? r.reason}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Alert>
  );
};

const CvInboxPage = () => {
  const { data, isLoading, isError, error } = useJobs({
    status: "open",
    pageSize: 100,
  });
  const jobs = data?.items ?? [];

  const [files, setFiles] = useState([]);
  const [localRejects, setLocalRejects] = useState([]);
  const [source, setSource] = useState(CV_SOURCES[0].value);
  const [jobId, setJobId] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState(null);

  const upload = useBulkUpload(jobId);

  const addFiles = (incoming) => {
    const rejects = [];
    const next = [...files];
    for (const f of incoming) {
      if (!isPdf(f)) {
        rejects.push({ filename: f.name, reason: "not_pdf" });
      } else if (f.size > CV_MAX_MB * 1024 * 1024) {
        rejects.push({ filename: f.name, reason: "too_large" });
      } else if (next.some((x) => x.name === f.name && x.size === f.size)) {
        // silent dedupe
      } else if (next.length >= BULK_MAX_FILES) {
        rejects.push({ filename: f.name, reason: "over_limit" });
      } else {
        next.push(f);
      }
    }
    setFiles(next);
    setLocalRejects(rejects);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const clearFiles = () => {
    setFiles([]);
    setLocalRejects([]);
  };

  const canUpload =
    !!jobId && files.length > 0 && consent && !upload.isPending;

  const handleUpload = () => {
    setResult(null);
    upload.mutate(files, {
      onSuccess: (res) => {
        setResult(res);
        setFiles([]);
        setLocalRejects([]);
        setConsent(false);
      },
    });
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 960, mx: "auto" }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          CV Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Upload CVs from any source. AI parses each one and routes them to the
          matched job pipeline.
        </Typography>
      </Box>

      <FlowBanner />

      {isError ? (
        <ErrorAlert error={error} />
      ) : isLoading ? (
        <CvInboxSkeleton />
      ) : (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upload CVs
            </Typography>

            <Stack spacing={3}>
              <UploadDropzone
                files={files}
                onAdd={addFiles}
                onRemove={removeFile}
                onClear={clearFiles}
                disabled={upload.isPending}
              />

              {localRejects.length > 0 && (
                <Alert severity="warning" onClose={() => setLocalRejects([])}>
                  <AlertTitle>
                    {localRejects.length} file
                    {localRejects.length === 1 ? "" : "s"} can&apos;t be uploaded
                  </AlertTitle>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {localRejects.map((r, i) => (
                      <Typography key={`${r.filename}-${i}`} component="li" variant="body2">
                        {r.filename} — {BULK_REJECTION_LABELS[r.reason] ?? r.reason}
                      </Typography>
                    ))}
                  </Box>
                </Alert>
              )}

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <Box>
                  <FieldLabel required>Source</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={upload.isPending}
                  >
                    {CV_SOURCES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.emoji} {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <FieldLabel required>Match against job</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    disabled={upload.isPending || jobs.length === 0}
                    helperText={
                      jobs.length === 0 ? (
                        <Box component="span">
                          No open jobs.{" "}
                          <Box component={Link} href="/jobs" sx={{ fontWeight: 700 }}>
                            Activate a job first
                          </Box>
                        </Box>
                      ) : (
                        " "
                      )
                    }
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value="" disabled>
                      Select a job…
                    </MenuItem>
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.title} — {job.hiring_company}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  bgcolor: "rgba(19,64,45,0.04)",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      disabled={upload.isPending}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {PDPL_CONSENT_LABEL}
                      </Box>{" "}
                      — {PDPL_CONSENT_TEXT}
                    </Typography>
                  }
                  sx={{ alignItems: "flex-start", m: 0, py: 0.5 }}
                />
              </Box>

              {upload.isError && <ErrorAlert error={upload.error} />}
              {result && (
                <ResultSummary
                  result={result}
                  jobId={jobId}
                  onReset={() => setResult(null)}
                />
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!canUpload}
                onClick={handleUpload}
                startIcon={
                  upload.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                endIcon={!upload.isPending && <ArrowForwardIcon />}
              >
                {upload.isPending
                  ? "Uploading…"
                  : `Upload and Parse CV${files.length === 1 ? "" : "s"}`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default CvInboxPage;
