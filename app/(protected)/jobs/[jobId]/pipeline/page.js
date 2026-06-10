"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CircleIcon from "@mui/icons-material/Circle";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import {
  useJob,
  useApplications,
  useMoveStage,
  useSetStatus,
} from "@/lib/kabil/queries";
import { PIPELINE_COLUMNS, humanize } from "@/lib/kabil/constants";
import { countryLabel } from "@/lib/kabil/jobOptions";
import PipelineBoard from "./_components/PipelineBoard";
import RejectedList from "./_components/RejectedList";
import CandidateDialog from "./_components/CandidateDialog";

const pctOf = (n, total) => (total ? Math.round((n / total) * 100) : 0);

/** Compact styling for the header Share button. */
const smallActionSx = {
  py: 0.125,
  px: 0.85,
  minHeight: 26,
  fontSize: "0.6875rem",
  lineHeight: 1.4,
  "& .MuiButton-startIcon": { mr: 0.4 },
};

/** Compact pipeline funnel above the board. */
const SummaryStrip = ({ counts, applied }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 0.5,
    }}
  >
    {PIPELINE_COLUMNS.map((col, i) => (
      <Stack key={col.stage} direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        {i > 0 && (
          <Stack direction="row" sx={{ alignItems: "center", color: "text.disabled" }}>
            <ArrowRightAltIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption">{pctOf(counts[col.stage], applied)}%</Typography>
          </Stack>
        )}
        <Chip
          size="small"
          label={`${counts[col.stage]} ${col.short}`}
          sx={{
            height: 24,
            fontWeight: 600,
            bgcolor: "transparent",
            border: "1px solid",
            borderColor: col.accent,
            color: col.accent,
          }}
        />
      </Stack>
    ))}
    <Chip
      size="small"
      label={`CONV ${pctOf(counts.done, applied)}%`}
      color="primary"
      sx={{ height: 24, fontWeight: 700, ml: 0.5 }}
    />
  </Box>
);

const PipelinePage = ({ params }) => {
  const { jobId } = use(params);
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const {
    data: appsData,
    isLoading: appsLoading,
    isError,
    error,
  } = useApplications(jobId, { pageSize: 100 });

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("accepted");
  const [selectedId, setSelectedId] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast] = useState(null);

  const moveStage = useMoveStage();
  const setStatus = useSetStatus();

  const items = useMemo(() => appsData?.items ?? [], [appsData]);

  // Rejected applicants live in their own tab; everything else is "accepted".
  const acceptedItems = useMemo(() => items.filter((a) => a.status !== "rejected"), [items]);
  const rejectedItems = useMemo(() => items.filter((a) => a.status === "rejected"), [items]);

  const matchesSearch = (a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.candidate_full_name?.toLowerCase().includes(q) ||
      a.candidate_email?.toLowerCase().includes(q)
    );
  };

  const byStage = useMemo(() => {
    const groups = Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c.stage, []]));
    for (const app of acceptedItems) {
      if (!matchesSearch(app)) continue;
      (groups[app.stage] ??= []).push(app);
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedItems, search]);

  const filteredRejected = useMemo(
    () => rejectedItems.filter(matchesSearch),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rejectedItems, search],
  );

  const counts = useMemo(() => {
    const c = Object.fromEntries(PIPELINE_COLUMNS.map((col) => [col.stage, 0]));
    for (const app of acceptedItems) if (c[app.stage] != null) c[app.stage] += 1;
    return c;
  }, [acceptedItems]);

  const total = appsData?.total ?? 0;

  // Public application link built from the job's slug — candidates apply here
  // (anonymous). Shared via the native sheet, with a clipboard fallback.
  const applyUrl =
    job?.public_slug && typeof window !== "undefined"
      ? `${window.location.origin}/apply/${job.public_slug}`
      : "";

  const share = async () => {
    if (!applyUrl) {
      setToast({ severity: "error", msg: "No public link available for this job yet." });
      return;
    }
    const data = {
      title: `Apply: ${job?.title || "Open role"}`,
      text: `Apply for ${job?.title || "this role"}${job?.hiring_company ? ` at ${job.hiring_company}` : ""}.`,
      url: applyUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(applyUrl);
      setToast({ severity: "success", msg: "Public apply link copied to clipboard" });
    } catch {
      /* user dismissed the share sheet — nothing to report */
    }
  };

  const handleMove = (app, stage) => {
    moveStage.mutate(
      { appId: app.id, stage },
      {
        onSuccess: () =>
          setToast({
            severity: "success",
            msg: `${app.candidate_full_name} moved to ${humanize(stage)}`,
          }),
        onError: () =>
          setToast({ severity: "error", msg: "Couldn't move candidate. Please try again." }),
      },
    );
  };

  const reactivate = (app) => {
    setPendingId(app.id);
    setStatus.mutate(
      { appId: app.id, status: "active" },
      {
        onSuccess: () =>
          setToast({
            severity: "success",
            msg: `${app.candidate_full_name} moved back to Accepted`,
          }),
        onError: () =>
          setToast({ severity: "error", msg: "Couldn't reactivate candidate. Please try again." }),
        onSettled: () => setPendingId(null),
      },
    );
  };

  const ready = !appsLoading && !isError && total > 0;

  return (
    <Stack spacing={2.5}>
      {/* Breadcrumb */}
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
        sx={{ fontSize: "0.8125rem", "& .MuiBreadcrumbs-li": { display: "flex" } }}
      >
        <MuiLink component={Link} href="/jobs" underline="hover" color="inherit" variant="body2">
          Jobs
        </MuiLink>
        <MuiLink
          component={Link}
          href={`/jobs/${jobId}`}
          underline="hover"
          color="inherit"
          variant="body2"
          sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {job?.title ?? "Job"}
        </MuiLink>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          Pipeline
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {jobLoading ? (
            <Skeleton variant="text" width="50%" height={32} />
          ) : (
            <Stack spacing={2}>
              {/* Title + actions pinned to the far right */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {job?.title ?? "Pipeline"}
                    </Typography>
                    {job && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <CircleIcon
                          sx={{
                            fontSize: 10,
                            color: job.status === "open" ? "success.main" : "text.disabled",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {humanize(job.status)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  {job && (
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {job.hiring_company} · {job.city}, {countryLabel(job.country)} · {total}{" "}
                      applicant{total === 1 ? "" : "s"}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<IosShareOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={share}
                    disabled={!job?.public_slug}
                    sx={smallActionSx}
                  >
                    Share
                  </Button>
                </Stack>
              </Stack>

              {/* Search + pipeline funnel */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ alignItems: { xs: "stretch", md: "center" } }}
              >
                <TextField
                  size="small"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                {ready && <SummaryStrip counts={counts} applied={acceptedItems.length} />}
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Accepted / Rejected tabs */}
      {ready && (
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: "divider", minHeight: 0 }}
        >
          <Tab
            value="accepted"
            sx={{ textTransform: "none", minHeight: 44 }}
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Accepted</span>
                <Chip size="small" label={acceptedItems.length} sx={{ height: 20, fontWeight: 700 }} />
              </Stack>
            }
          />
          <Tab
            value="rejected"
            sx={{ textTransform: "none", minHeight: 44 }}
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Rejected</span>
                <Chip
                  size="small"
                  color={rejectedItems.length ? "error" : "default"}
                  label={rejectedItems.length}
                  sx={{ height: 20, fontWeight: 700 }}
                />
              </Stack>
            }
          />
        </Tabs>
      )}

      {/* Body */}
      {isError ? (
        <ErrorAlert error={error} />
      ) : appsLoading ? (
        <Stack direction="row" spacing={2.5} sx={{ overflowX: "auto", pb: 1 }}>
          {PIPELINE_COLUMNS.map((c) => (
            <Box key={c.stage} sx={{ width: { xs: 250, md: 300 }, flexShrink: 0 }}>
              <Skeleton variant="rounded" height={48} sx={{ mb: 1.5 }} />
              <Skeleton variant="rounded" height={120} sx={{ mb: 1.5 }} />
              <Skeleton variant="rounded" height={120} />
            </Box>
          ))}
        </Stack>
      ) : total === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <EmptyState
            emoji="📥"
            title="No applications yet"
            description="Candidates who apply will move through the pipeline stages here."
          />
        </Card>
      ) : tab === "accepted" ? (
        <PipelineBoard
          byStage={byStage}
          jobTitle={job?.title}
          onOpen={setSelectedId}
          onMove={handleMove}
        />
      ) : filteredRejected.length === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <EmptyState
            emoji="✅"
            title="No rejected candidates"
            description="Candidates you reject from the pipeline will appear here."
          />
        </Card>
      ) : (
        <RejectedList
          apps={filteredRejected}
          jobTitle={job?.title}
          onOpen={setSelectedId}
          onReactivate={reactivate}
          busyId={pendingId}
        />
      )}

      <CandidateDialog
        appId={selectedId}
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
};

export default PipelinePage;
