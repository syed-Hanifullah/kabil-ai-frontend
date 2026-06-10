"use client";

import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import SearchField from "@/components/SearchField";
import CandidateRow from "./_components/CandidateRow";
import SourceToJobDialog from "./_components/SourceToJobDialog";
import UploadToPoolDialog from "./_components/UploadToPoolDialog";
import ViewCandidateDialog from "./_components/ViewCandidateDialog";
import { useTalentPool, useTalentPoolSearch } from "@/lib/kabil/queries";
import {
  PAGE_SIZE,
  TALENT_POOL_SEARCH_MIN_LENGTH,
  TALENT_POOL_SEARCH_MAX_LENGTH,
  TALENT_POOL_SEARCH_DEFAULT_LIMIT,
} from "@/lib/kabil/constants";

const SEARCH_DEBOUNCE_MS = 350;

/** Mirrors the row layout while the list loads. */
const RowSkeleton = () => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{ alignItems: "center", px: 2.5, py: 1.75, "&:not(:last-of-type)": { borderBottom: "1px solid #eef1ef" } }}
  >
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="35%" height={22} />
      <Skeleton variant="text" width="55%" height={18} />
    </Box>
    <Skeleton variant="rounded" width={120} height={32} />
  </Stack>
);

const ListSkeleton = () => (
  <Card sx={{ borderRadius: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <RowSkeleton key={i} />
    ))}
  </Card>
);

const TalentPoolPage = () => {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [sourceTarget, setSourceTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Debounce the raw input into the value we actually query with.
  useEffect(() => {
    const id = setTimeout(() => setQuery(rawQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const searching = query.length >= TALENT_POOL_SEARCH_MIN_LENGTH;

  const browse = useTalentPool({
    activeOnly,
    page,
    pageSize: PAGE_SIZE,
    enabled: !searching,
  });

  const search = useTalentPoolSearch(query, {
    activeOnly,
    limit: TALENT_POOL_SEARCH_DEFAULT_LIMIT,
    enabled: searching,
  });

  const active = searching ? search : browse;
  const items = active.data?.items ?? [];
  const total = active.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // The debounced query is still catching up to what the user just typed.
  const debouncing = rawQuery.trim() !== query;
  const spinner = active.isFetching || debouncing;

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Talent Pool
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Semantically search pooled candidates and source the best fits onto a job.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadOutlinedIcon />}
          onClick={() => setUploadOpen(true)}
        >
          Upload CV
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
      >
        <SearchField
          width={420}
          placeholder="Search by skills, role, experience…"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value.slice(0, TALENT_POOL_SEARCH_MAX_LENGTH))}
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
        <FormControlLabel
          control={
            <Switch
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(1);
              }}
            />
          }
          label="Active only"
        />
      </Stack>

      {active.isError ? (
        <ErrorAlert error={active.error} />
      ) : active.isLoading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <EmptyState
            emoji={searching ? "🔍" : "🧑‍💼"}
            title={searching ? "No matches" : "The pool is empty"}
            description={
              searching
                ? "No pooled candidate matches that search. Try different keywords, or turn off “Active only”."
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
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searching
                ? `${total} match${total === 1 ? "" : "es"} for “${query}”, best first`
                : `${total} candidate${total === 1 ? "" : "s"} in the pool`}
            </Typography>
          </Stack>

          <Card sx={{ borderRadius: 2 }}>
            {items.map((entry) => (
              <CandidateRow
                key={entry.entry_id || entry.id}
                entry={entry}
                onOpen={(e) => setViewTarget(e)}
                onSource={(e) => setSourceTarget(e.candidate)}
              />
            ))}
          </Card>

          {!searching && pageCount > 1 && (
            <Stack sx={{ alignItems: "center" }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Stack>
          )}
        </Stack>
      )}

      <ViewCandidateDialog
        entry={viewTarget}
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
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
