"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import SearchField from "@/components/SearchField";
import { useJobs } from "@/lib/kabil/queries";
import JobCard, { JobCardSkeleton } from "./_components/JobCard";

const TABS = [
  { label: "Active", status: "open" },
  { label: "Drafts", status: "draft" },
  { label: "Archived", status: "closed" },
];

/** 3-up responsive grid (1 / 2 / 3 columns). */
const grid = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

const JobsGridSkeleton = () => (
  <Box sx={grid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </Box>
);

const JobsPageInner = () => {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [createdToast, setCreatedToast] = useState(!!searchParams.get("created"));

  const status = TABS[tab].status;
  const { data, isLoading, isError, error, refetch } = useJobs({
    status,
    search: search.trim() || undefined,
    pageSize: 50,
  });

  const jobs = data?.items ?? [];

  return (
    <Stack spacing={2.5}>
      {/* Toolbar: search + primary action */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <SearchField
          placeholder="Search jobs…"
          width={320}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button component={Link} href="/jobs/new" variant="contained" startIcon={<AddIcon />}>
          Post New Job
        </Button>
      </Stack>

      <Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {TABS.map((t) => (
            <Tab key={t.label} label={t.label} sx={{ textTransform: "none", fontWeight: 600 }} />
          ))}
        </Tabs>
      </Box>

      {isLoading ? (
        <JobsGridSkeleton />
      ) : isError ? (
        <ErrorAlert error={error} />
      ) : jobs.length === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <EmptyState
            emoji="💼"
            title={search ? "No matching jobs" : "No jobs here yet"}
            description={
              search
                ? "Try a different search term."
                : `No ${TABS[tab].label.toLowerCase()} jobs. Post your first job to get started.`
            }
            action={
              !search && (
                <Button component={Link} href="/jobs/new" variant="contained">
                  Post a Job
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Box sx={grid}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </Box>
      )}

      <Snackbar
        open={createdToast}
        autoHideDuration={5000}
        onClose={() => setCreatedToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCreatedToast(false)}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Refresh
            </Button>
          }
        >
          Job created — it’s now in your list.
        </Alert>
      </Snackbar>
    </Stack>
  );
};

const JobsPage = () => (
  <Suspense fallback={<JobsGridSkeleton />}>
    <JobsPageInner />
  </Suspense>
);

export default JobsPage;
