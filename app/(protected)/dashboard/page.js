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
import { useDashboard } from "@/lib/kabil/queries";

/**
 * Maps the DashboardSummaryResponse onto the four headline cards. The breakdown
 * maps are zero-filled across every enum value by the backend, so we read keys
 * directly — no missing-key guards. "New Applications" is the Applied column
 * (`vector_screen`); "In Review" is every still-active candidate.
 */
const STAT_CARDS = [
  {
    label: "Open Jobs",
    icon: BusinessCenterOutlinedIcon,
    select: (d) => d.jobs.by_status.open,
  },
  {
    label: "New Applications",
    icon: InboxOutlinedIcon,
    select: (d) => d.applications.by_stage.vector_screen,
  },
  {
    label: "In Review",
    icon: HourglassEmptyOutlinedIcon,
    select: (d) => d.applications.by_status.active,
  },
  {
    label: "Talent Pool",
    icon: GroupsOutlinedIcon,
    select: (d) => d.talent_pool.active,
  },
];

const grid = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
};

const StatCard = ({ label, icon: Icon, value, loading }) => (
  <Card sx={{ borderRadius: 2 }}>
    <CardContent>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          {loading ? (
            <Skeleton variant="text" width={56} sx={{ fontSize: "2.125rem" }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(19,64,45,0.08)",
            color: "primary.main",
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

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Overview
      </Typography>

      {isError && <ErrorAlert error={error} />}

      <Box sx={grid}>
        {STAT_CARDS.map(({ label, icon, select }) => (
          <StatCard
            key={label}
            label={label}
            icon={icon}
            loading={isLoading}
            value={data ? select(data) : "—"}
          />
        ))}
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recent activity
          </Typography>
          <Typography color="text.secondary">
            Activity from your jobs and applications will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DashboardPage;
