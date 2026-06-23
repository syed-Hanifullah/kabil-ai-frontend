"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ErrorAlert from "@/components/ErrorAlert";
import { useDashboard, usePerformance } from "@/lib/kabil/queries";
import PerformanceTable from "./_components/PerformanceTable";
import CandidatePipelinePanel from "./_components/CandidatePipelinePanel";
import UpcomingInterviewsCard from "./_components/UpcomingInterviewsCard";
import PendingFeedbackCard from "./_components/PendingFeedbackCard";

/**
 * Maps the DashboardSummaryResponse onto the four Overview cards. The breakdown
 * maps are zero-filled across every enum value by the backend, so we read keys
 * directly — no missing-key guards. "New Applications" is the Applied column
 * (`vector_screen`); "In Review" is every still-active candidate. Each card
 * carries an accent color (for its icon tile + hover bar) and a secondary line
 * pulled from the same payload to give the headline number some context.
 */
const STAT_CARDS = [
  {
    label: "Open Jobs",
    icon: BusinessCenterOutlinedIcon,
    accent: "#13402d",
    value: (d) => d.jobs.by_status.open,
    sub: (d) => `${d.jobs.total} total · ${d.jobs.by_status.draft} draft`,
  },
  {
    label: "New Applications",
    icon: InboxOutlinedIcon,
    accent: "#c9a23f",
    value: (d) => d.applications.by_stage.vector_screen,
    sub: (d) => `${d.applications.total} all-time`,
  },
  {
    label: "In Review",
    icon: HourglassEmptyOutlinedIcon,
    accent: "#2f7fd1",
    value: (d) => d.applications.by_status.active,
    sub: (d) => `${d.applications.by_status.accepted} accepted`,
  },
  {
    label: "Talent Pool",
    icon: GroupsOutlinedIcon,
    accent: "#8155c9",
    value: (d) => d.talent_pool.active,
    sub: (d) => `${d.candidates.total} candidates`,
  },
];

const grid = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
};

const StatCard = ({ label, icon: Icon, accent, value, sub, loading }) => (
  <Card
    sx={{
      position: "relative",
      borderRadius: 2.5,
      overflow: "hidden",
      transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
      "&::before": {
        content: '""',
        position: "absolute",
        insetInline: 0,
        top: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent} 0%, ${accent}55 100%)`,
        opacity: 0,
        transition: "opacity .2s ease",
      },
      "&:hover": {
        transform: "translateY(-4px)",
        borderColor: "transparent",
        boxShadow: "0 12px 28px -10px rgba(19,64,45,.35)",
      },
      "&:hover::before": { opacity: 1 },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ minWidth: 0 }}>
          {loading ? (
            <Skeleton variant="text" width={56} sx={{ fontSize: "1.9rem" }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {value}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={88} />
          ) : (
            <Typography variant="caption" color="text.secondary" noWrap>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: `${accent}14`,
            color: accent,
          }}
        >
          <Icon />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useDashboard();
  const performance = usePerformance();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          A snapshot of your jobs, applications, and talent pool.
        </Typography>
      </Box>

      {isError && <ErrorAlert error={error} />}
      {performance.isError && <ErrorAlert error={performance.error} />}

      <Box sx={grid}>
        {STAT_CARDS.map(({ label, icon, accent, value, sub }) => (
          <StatCard
            key={label}
            label={label}
            icon={icon}
            accent={accent}
            loading={isLoading}
            value={data ? value(data) : "—"}
            sub={data ? sub(data) : ""}
          />
        ))}
      </Box>

      {/* Performance + Candidate Pipeline */}
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          alignItems: "stretch",
        }}
      >
        <PerformanceTable data={performance.data} loading={performance.isLoading} />
        <CandidatePipelinePanel />
      </Box>

      {/* Upcoming interviews + Pending feedback */}
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "stretch",
        }}
      >
        <UpcomingInterviewsCard />
        <PendingFeedbackCard />
      </Box>
    </Stack>
  );
};

export default DashboardPage;
