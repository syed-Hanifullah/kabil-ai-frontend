"use client";

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
import { jobHealthChip, jobStatusColor, humanize } from "@/lib/kabil/constants";

/**
 * The Performance table — one row per non-draft job from
 * `GET /dashboard/performance` (rows arrive at-risk-first). Each row links to
 * that job's pipeline board. `candidates` / `shortlisted` exclude archived
 * stints; `days_open` is whole days since the job was created; `health` is the
 * server-computed JobHealth verdict.
 */
const HEAD_CELLS = [
  { key: "title", label: "Role", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "candidates", label: "Candidates", align: "right" },
  { key: "shortlisted", label: "Shortlisted", align: "right" },
  { key: "days_open", label: "Days Open", align: "right" },
  { key: "health", label: "Health", align: "right" },
];

const PerformanceTable = ({ data, loading }) => {
  const router = useRouter();
  const rows = (data?.rows ?? []).filter((r) => r.status === "open");

  return (
    <Card sx={{ borderRadius: 2.5, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
          Performance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Open roles, with the ones needing attention first.
        </Typography>

        {loading ? (
          <Stack spacing={1.25}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={40} />
            ))}
          </Stack>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No open jobs yet.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
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
                {rows.map((r) => {
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
