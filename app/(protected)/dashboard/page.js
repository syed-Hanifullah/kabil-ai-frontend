"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ErrorAlert from "@/components/ErrorAlert";
import { PIPELINE_COLUMNS } from "@/lib/kabil/constants";
import { useDashboard } from "@/lib/kabil/queries";

/**
 * Maps the DashboardSummaryResponse onto the four headline cards. The breakdown
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

/** One horizontal funnel row: stage label, count, and a proportional bar
 *  scaled against the busiest stage so the widest bar fills the track. */
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

const PipelineCard = ({ data, loading }) => {
  const stages = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    count: data ? data.applications.by_stage[col.stage] : 0,
  }));
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <Card sx={{ borderRadius: 2.5, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
          Hiring pipeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Active candidates across each stage.
        </Typography>

        {loading ? (
          <Stack spacing={2.25}>
            {PIPELINE_COLUMNS.map((_, i) => (
              <Box key={i}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rounded" height={8} sx={{ borderRadius: 999 }} />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            {stages.map((s) => (
              <FunnelRow
                key={s.stage}
                label={s.label}
                accent={s.accent}
                count={s.count}
                max={max}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

/** Application outcomes as a single stacked bar + legend. */
const OUTCOMES = [
  { key: "active", label: "In review", color: "#2f7fd1" },
  { key: "accepted", label: "Accepted", color: "#1f9d57" },
  { key: "rejected", label: "Rejected", color: "#c44545" },
];

const OutcomesCard = ({ data, loading }) => {
  const by = data?.applications.by_status;
  const total = by ? OUTCOMES.reduce((sum, o) => sum + by[o.key], 0) : 0;

  return (
    <Card sx={{ borderRadius: 2.5, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
          Application outcomes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {loading ? "—" : `${data.applications.total} applications, all-time.`}
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={12} sx={{ borderRadius: 999 }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="50%" />
          </Stack>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                bgcolor: "rgba(19,64,45,0.06)",
              }}
            >
              {total > 0 &&
                OUTCOMES.map((o) => (
                  <Box
                    key={o.key}
                    sx={{ width: `${(by[o.key] / total) * 100}%`, bgcolor: o.color }}
                  />
                ))}
            </Box>

            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              {OUTCOMES.map((o) => (
                <Stack
                  key={o.key}
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: o.color }} />
                    <Typography variant="body2">{o.label}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {by[o.key]}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                      {total > 0 ? `${Math.round((by[o.key] / total) * 100)}%` : "0%"}
                    </Typography>
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useDashboard();

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

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          alignItems: "stretch",
        }}
      >
        <PipelineCard data={data} loading={isLoading} />
        <OutcomesCard data={data} loading={isLoading} />
      </Box>
    </Stack>
  );
};

export default DashboardPage;
