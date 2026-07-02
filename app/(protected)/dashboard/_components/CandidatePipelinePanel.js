"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { PIPELINE_BUCKETS } from "@/lib/kabil/constants";
import { useCandidatePipeline, useJobs } from "@/lib/kabil/queries";

/** One funnel row: bucket label, count, and a proportional bar. */
const FunnelRow = ({ label, accent, count, max }) => (
  <Box>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {count}
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={max > 0 ? (count / max) * 100 : 0}
      sx={{
        height: 8,
        borderRadius: 999,
        bgcolor: "rgba(19,64,45,0.06)",
        "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: accent },
      }}
    />
  </Box>
);

/**
 * Candidate Pipeline funnel with an "All Jobs" / per-job selector. The dropdown
 * is populated from the jobs list; selecting a job re-queries
 * `GET /dashboard/pipeline?job_id=…` (empty selection = workspace-wide). The
 * footer shows the Applied→Offer conversion from the same payload.
 */
const CandidatePipelinePanel = () => {
  // Default to the first job; `touched` flips once the user picks any scope
  // (including "All Jobs", value ""), after which we respect their choice.
  const [touched, setTouched] = useState(false);
  const [picked, setPicked] = useState("");
  const { data: jobsData } = useJobs({ pageSize: 50 });
  const jobs = jobsData?.items ?? [];

  const jobId = touched ? picked : (jobs[0]?.id ?? "");
  const { data, isLoading } = useCandidatePipeline(jobId || null, {
    // Hold the pipeline query until the job list resolves so we fetch the
    // first job straight away rather than flashing the All-Jobs aggregate.
    enabled: jobsData !== undefined,
  });
  const loading = isLoading || jobsData === undefined;

  const buckets = PIPELINE_BUCKETS.map((b) => ({
    ...b,
    count: data ? (data.by_bucket[b.bucket] ?? 0) : 0,
  }));
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const conversion = data?.conversion_rate ?? 0;

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        height: "100%",
        borderTop: "3px solid",
        borderTopColor: "primary.main",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2 }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
            <TimelineOutlinedIcon fontSize="small" color="primary" />
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }} noWrap>
              Candidate Pipeline
            </Typography>
          </Stack>
          <TextField
            select
            size="small"
            value={jobId}
            onChange={(e) => {
              setTouched(true);
              setPicked(e.target.value);
            }}
            slotProps={{
              select: {
                displayEmpty: true,
                renderValue: (value) =>
                  value ? (jobs.find((j) => j.id === value)?.title ?? "All Jobs") : "All Jobs",
              },
            }}
            sx={{ minWidth: 140, maxWidth: 200 }}
          >
            <MenuItem value="">All Jobs</MenuItem>
            {jobs.map((j) => (
              <MenuItem key={j.id} value={j.id}>
                {j.title}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Stack spacing={2.25}>
            {PIPELINE_BUCKETS.map((_, i) => (
              <Box key={i}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rounded" height={8} sx={{ borderRadius: 999 }} />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            {buckets.map((b) => (
              <FunnelRow key={b.bucket} label={b.label} accent={b.accent} count={b.count} max={max} />
            ))}
          </Stack>
        )}

        {/* Applied → Offer conversion */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(19,64,45,0.03)",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Conversion (Applied → Offer)
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} sx={{ fontSize: "1.5rem" }} />
          ) : (
            <>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.15rem" }}>
                {conversion}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.offers
                  ? `${data.offers} of ${data.applied} applicants`
                  : "No offers made yet"}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidatePipelinePanel;
