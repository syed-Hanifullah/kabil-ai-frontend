"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CloseIcon from "@mui/icons-material/Close";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import SearchField from "@/components/SearchField";
import CandidateRow from "./_components/CandidateRow";
import CandidateHistoryDialog from "./_components/CandidateHistoryDialog";
import SourceToJobDialog from "./_components/SourceToJobDialog";
import UploadToPoolDialog from "./_components/UploadToPoolDialog";
import ViewCandidateDialog from "./_components/ViewCandidateDialog";
import { useTalentPool, useTalentPoolSearch, useJobs } from "@/lib/kabil/queries";
import {
  PAGE_SIZE,
  TALENT_POOL_SEARCH_MIN_LENGTH,
  TALENT_POOL_SEARCH_MAX_LENGTH,
  TALENT_POOL_SEARCH_MAX_LIMIT,
  POOL_SCORE_FILTERS,
  POOL_HIGH_SCORE,
  POOL_READY_SCORE,
  inPoolScoreBand,
  toScore,
} from "@/lib/kabil/constants";

const SEARCH_DEBOUNCE_MS = 350;

const HEAD_CELLS = ["Candidate", "Role", "AI Score", "Source", "Status", ""];

// Uniform soft-cream circle for every stat icon, matching the reference.
const STAT_TILE = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  bgcolor: "#fbecd4",
  color: "#EF9F27",
};

const PoolStat = ({ icon: Icon, value, label, loading }) => (
  <Card sx={{ borderRadius: "5px" }}>
    <CardContent sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center", "&:last-child": { pb: 2 } }}>
      <Box sx={STAT_TILE}>
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {loading ? (
          <Skeleton variant="text" width={32} sx={{ fontSize: "1.4rem" }} />
        ) : (
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: "1.4rem" }}>
            {value}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const TableSkeleton = () => (
  <Stack spacing={1.25} sx={{ p: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Skeleton variant="circular" width={38} height={38} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="50%" />
        </Box>
        <Skeleton variant="rounded" width={90} height={28} />
      </Stack>
    ))}
  </Stack>
);

const TalentPoolPage = () => {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(""); // "" = All sources
  const [scoreFilter, setScoreFilter] = useState(""); // "" = All scores
  const [page, setPage] = useState(1);
  const [sourceTarget, setSourceTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Debounce the raw input into the value we actually query with.
  useEffect(() => {
    const id = setTimeout(() => setQuery(rawQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const byJob = Boolean(selectedJob);
  const textSearching = !byJob && query.length >= TALENT_POOL_SEARCH_MIN_LENGTH;
  const searching = byJob || textSearching;

  const { data: jobsData } = useJobs({ pageSize: 50 });
  // Only non-draft jobs have a JD embedding to rank against (embedded on open).
  const jobs = (jobsData?.items ?? []).filter((j) => j.status !== "draft");

  // Browse (default) vs. semantic search (by job JD-embedding or free text).
  const browse = useTalentPool({ page, pageSize: PAGE_SIZE, enabled: !searching });
  const search = useTalentPoolSearch(query, {
    jobId: selectedJob || null,
    // Show every match (no pagination on search): a wide set for the job stat
    // cards, and all lexical hits so a role/skill search isn't silently capped.
    limit: TALENT_POOL_SEARCH_MAX_LIMIT,
    enabled: searching,
  });
  // "Total in Pool" is the whole pool regardless of the active filter.
  const poolCount = useTalentPool({ pageSize: 1, enabled: searching });

  const active = searching ? search : browse;
  const items = useMemo(() => active.data?.items ?? [], [active.data]);
  const totalInPool = searching ? (poolCount.data?.total ?? 0) : (browse.data?.total ?? 0);
  const total = active.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Stat cards live off the matched result set (the score band filters the table
  // only). Browse mode has no scores, so the score-based cards read 0.
  const stats = useMemo(() => {
    const scored = items.map((i) => toScore(i.similarity_score)).filter((n) => n != null);
    return {
      matched: scored.length,
      high: scored.filter((n) => n >= POOL_HIGH_SCORE).length,
      ready: items.filter(
        (i) => i.is_active && (toScore(i.similarity_score) ?? -1) >= POOL_READY_SCORE,
      ).length,
    };
  }, [items]);

  // The AI-score band filter only applies to job (semantic) search, where hits
  // carry a score. Text search is lexical (no score), so it isn't filtered.
  const visibleItems = useMemo(
    () => (byJob ? items.filter((i) => inPoolScoreBand(i.similarity_score, scoreFilter)) : items),
    [items, scoreFilter, byJob],
  );

  const debouncing = rawQuery.trim() !== query;
  const spinner = active.isFetching || debouncing;

  const anyFilter = Boolean(rawQuery || selectedJob || scoreFilter);
  const clearFilters = () => {
    setRawQuery("");
    setQuery("");
    setSelectedJob("");
    setScoreFilter("");
    setPage(1);
  };

  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: "primary.main" }}>
            Talent Pool
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ready to match against your open jobs
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/cv-inbox"
          variant="outlined"
          startIcon={<CloudUploadOutlinedIcon />}
          sx={{
            borderColor: "primary.main",
            color: "primary.main",
            fontWeight: 700,
            bgcolor: "#fff",
            "&:hover": { borderColor: "primary.dark", bgcolor: "#f4f8f6" },
          }}
        >
          Upload CVs → CV Inbox
        </Button>
      </Stack>

      {/* Toolbar: search + Sources (jobs) + Scores, inside a card */}
      <Card sx={{ borderRadius: "5px" }}>
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            sx={{ alignItems: { xs: "stretch", md: "center" } }}
          >
            <SearchField
              placeholder="Search…"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value.slice(0, TALENT_POOL_SEARCH_MAX_LENGTH))}
              disabled={byJob}
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f2efe7",
                  borderRadius: "5px",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "transparent" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {spinner ? (
                        <CircularProgress size={16} />
                      ) : rawQuery ? (
                        <IconButton size="small" aria-label="Clear search" onClick={() => setRawQuery("")}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              value={selectedJob}
              onChange={(e) => {
                setSelectedJob(e.target.value);
                setScoreFilter("");
              }}
              slotProps={{ select: { displayEmpty: true } }}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">All sources</MenuItem>
              {jobs.map((j) => (
                <MenuItem key={j.id} value={j.id}>
                  {j.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              // AI scores only exist for job (semantic) search; text search is lexical.
              disabled={!byJob}
              slotProps={{ select: { displayEmpty: true } }}
              sx={{ minWidth: 150 }}
            >
              {POOL_SCORE_FILTERS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title={anyFilter ? "Clear filters" : "No active filters"}>
              <span>
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<FilterAltOutlinedIcon />}
                  onClick={clearFilters}
                  disabled={!anyFilter}
                  sx={{
                    textTransform: "none",
                    flexShrink: 0,
                    fontWeight: 600,
                    color: "text.secondary",
                    bgcolor: "#f2efe7",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "#e9e5da" },
                  }}
                >
                  Filters
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* Stat cards — recompute as filters change */}
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        }}
      >
        <PoolStat
          icon={GroupsOutlinedIcon}
          value={totalInPool}
          label="Total in Pool"
          loading={active.isLoading}
        />
        <PoolStat
          icon={BoltOutlinedIcon}
          value={stats.matched}
          label="AI Matched"
          loading={active.isLoading}
        />
        <PoolStat
          icon={TrendingUpOutlinedIcon}
          value={stats.high}
          label={`High Score (${POOL_HIGH_SCORE}+)`}
          loading={active.isLoading}
        />
        <PoolStat
          icon={CheckCircleOutlineIcon}
          value={stats.ready}
          label="Ready to Match"
          loading={active.isLoading}
        />
      </Box>

      {active.isError ? (
        <ErrorAlert error={active.error} />
      ) : active.isLoading ? (
        <Card sx={{ borderRadius: "5px" }}>
          <TableSkeleton />
        </Card>
      ) : visibleItems.length === 0 ? (
        <Card sx={{ borderRadius: "5px" }}>
          <EmptyState
            emoji={searching ? "🔍" : "🧑‍💼"}
            title={searching ? "No matches" : "The pool is empty"}
            description={
              searching
                ? "No pooled candidate matches these filters. Try a different source, score, or search term."
                : "Upload CVs straight into the pool, or shortlist candidates from a job to collect them here."
            }
            action={
              !searching && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadOutlinedIcon />}
                  onClick={() => setUploadOpen(true)}
                >
                  Upload CV
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Stack spacing={2}>
          {/* Search context — hidden in the default browse view (matches the design) */}
          {searching && (
            <Typography variant="body2" color="text.secondary">
              {byJob
                ? `${visibleItems.length} of ${total} match${total === 1 ? "" : "es"} for “${
                    jobs.find((j) => j.id === selectedJob)?.title ?? "job"
                  }”, best match first`
                : `${total} match${total === 1 ? "" : "es"} for “${query}” by role, skills or name`}
            </Typography>
          )}

          <Card sx={{ borderRadius: "5px", border: "1px solid #EDE8DF" }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ "& td, & th": { borderColor: "#eef1ef" } }}>
                <TableHead sx={{ bgcolor: "#F9F7F3" }}>
                  <TableRow>
                    {HEAD_CELLS.map((c, i) => (
                      <TableCell
                        key={c || `actions-${i}`}
                        align={i === HEAD_CELLS.length - 1 ? "right" : "left"}
                        sx={{
                          fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                          fontWeight: 600,
                          fontSize: "11.5px",
                          lineHeight: "17.25px",
                          letterSpacing: "0.4px",
                          textTransform: "uppercase",
                          color: "#6B7280",
                          whiteSpace: "nowrap",
                          bgcolor: "#F9F7F3",
                        }}
                      >
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleItems.map((entry) => (
                    <CandidateRow
                      key={entry.entry_id || entry.id}
                      entry={entry}
                      onOpen={(e) => setViewTarget(e)}
                      onSource={(e) => setSourceTarget(e.candidate)}
                      onHistory={(e) => setHistoryTarget(e.candidate)}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>

          {!searching && pageCount > 1 && (
            <Stack sx={{ alignItems: "center" }}>
              <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" />
            </Stack>
          )}
        </Stack>
      )}

      <ViewCandidateDialog entry={viewTarget} open={!!viewTarget} onClose={() => setViewTarget(null)} />
      <CandidateHistoryDialog
        candidateId={historyTarget?.id}
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
      <SourceToJobDialog
        candidate={sourceTarget}
        open={!!sourceTarget}
        onClose={() => setSourceTarget(null)}
      />
      <UploadToPoolDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Stack>
  );
};

export default TalentPoolPage;
