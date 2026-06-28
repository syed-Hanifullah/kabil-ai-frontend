"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {
  jobHealthChip,
  jobStatusColor,
  humanize,
  PIPELINE_BUCKETS,
} from "@/lib/kabil/constants";
import { useCandidatePipeline } from "@/lib/kabil/queries";
import DonutChart from "./DonutChart";

/**
 * The Performance card. Toggles between:
 *  - a table — one row per open job from `GET /dashboard/performance`
 *    (at-risk-first); each row links to that job's pipeline board.
 *  - a pie (donut) chart — "All Jobs" shows the health mix across every job in
 *    the payload; picking a single job shows that job's candidate pipeline
 *    buckets from `GET /dashboard/pipeline?job_id=…`.
 *
 * `candidates` / `shortlisted` exclude archived stints; `days_open` is whole
 * days since creation; `health` is the server-computed JobHealth verdict.
 */
const HEAD_CELLS = [
  { key: "title", label: "Role", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "candidates", label: "Candidates", align: "right" },
  { key: "shortlisted", label: "Shortlisted", align: "right" },
  { key: "days_open", label: "Days Open", align: "right" },
  { key: "health", label: "Health", align: "right" },
];

// Health categories for the "All Jobs" donut, in fixed legend order. Values are
// the backend JobHealth enum (see `jobHealthChip`); colors echo the chart mock.
const HEALTH_SEGMENTS = [
  { key: "healthy", label: "Healthy", color: "#1f9d57" },
  { key: "at_risk", label: "At Risk", color: "#c9a23f" },
  { key: "shortlisted", label: "Shortlisted", color: "#2f7fd1" },
];

/** Donut segments for the workspace-wide health distribution. */
const healthSegments = (rows) =>
  HEALTH_SEGMENTS.map((s) => ({
    label: s.label,
    color: s.color,
    value: rows.filter((r) => r.health === s.key).length,
  }));

/** Donut segments for one job's candidate pipeline buckets. */
const bucketSegments = (byBucket) =>
  PIPELINE_BUCKETS.map((b) => ({
    label: b.label,
    color: b.accent,
    value: byBucket?.[b.bucket] ?? 0,
  }));

const PerformanceTable = ({ data, loading }) => {
  const router = useRouter();
  const [view, setView] = useState("table");
  const [selectedJob, setSelectedJob] = useState(""); // "" = All Jobs

  const allRows = data?.rows ?? [];
  const tableRows = allRows.filter((r) => r.status === "open");

  // Per-job pipeline — only fetched in chart mode with a specific job picked.
  const { data: pipeline, isLoading: pipelineLoading } = useCandidatePipeline(
    selectedJob || null,
    { enabled: view === "chart" && Boolean(selectedJob) },
  );

  const isChart = view === "chart";
  const chartLoading = loading || (Boolean(selectedJob) && pipelineLoading);
  const segments = selectedJob
    ? bucketSegments(pipeline?.by_bucket)
    : healthSegments(allRows);

  return (
    <Card sx={{ borderRadius: 2.5, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
              Performance
            </Typography>
            {!isChart && (
              <Typography variant="body2" color="text.secondary">
                Open roles, with the ones needing attention first.
              </Typography>
            )}
          </Box>
          <Button
            variant="text"
            size="small"
            onClick={() => setView(isChart ? "table" : "chart")}
            sx={{ textTransform: "none", fontWeight: 600, color: "#1f7a52", flexShrink: 0 }}
          >
            {isChart ? "View Table" : "View Pie Chart"}
          </Button>
        </Stack>

        {isChart ? (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 1 }}>
              <TextField
                select
                size="small"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                disabled={loading}
                slotProps={{ select: { displayEmpty: true } }}
                sx={{ minWidth: 150, maxWidth: 220 }}
              >
                <MenuItem value="">All Jobs</MenuItem>
                {allRows.map((r) => (
                  <MenuItem key={r.job_id} value={r.job_id}>
                    {r.title}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {chartLoading ? (
              <Stack sx={{ alignItems: "center", py: 3 }}>
                <Skeleton variant="circular" width={210} height={210} />
              </Stack>
            ) : (
              <DonutChart segments={segments} />
            )}
          </Box>
        ) : loading ? (
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={40} />
            ))}
          </Stack>
        ) : tableRows.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 3, textAlign: "center", mt: 2 }}
          >
            No open jobs yet.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto", mt: 2 }}>
            <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
              <TableHead>
                <TableRow>
                  {HEAD_CELLS.map((c) => (
                    <TableCell
                      key={c.key}
                      align={c.align}
                      sx={{ fontWeight: 700, color: "text.secondary", whiteSpace: "nowrap" }}
                    >
                      {c.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((r) => {
                  const health = jobHealthChip(r.health);
                  return (
                    <TableRow
                      key={r.job_id}
                      hover
                      onClick={() => router.push(`/jobs/${r.job_id}/pipeline`)}
                      sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                    >
                      <TableCell sx={{ fontWeight: 600, maxWidth: 220 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                          {r.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={humanize(r.status)}
                          color={jobStatusColor(r.status)}
                        />
                      </TableCell>
                      <TableCell align="right">{r.candidates}</TableCell>
                      <TableCell align="right">{r.shortlisted}</TableCell>
                      <TableCell align="right">{r.days_open}</TableCell>
                      <TableCell align="right">
                        <Chip size="small" label={health.label} color={health.color} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;
