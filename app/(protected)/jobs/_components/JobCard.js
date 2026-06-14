"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CircleIcon from "@mui/icons-material/Circle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { humanize, timeAgo } from "@/lib/kabil/constants";
import { countryLabel } from "@/lib/kabil/jobOptions";
import { useUpdateJobStatus } from "@/lib/kabil/queries";

/** Status transitions surfaced in the 3-dots menu, keyed by current status. */
const STATUS_ACTIONS = {
  draft: [{ label: "Move to Active", status: "open", icon: PlayArrowOutlinedIcon }],
  open: [{ label: "Close job", status: "closed", icon: ArchiveOutlinedIcon }],
  closed: [{ label: "Reopen job", status: "open", icon: ReplayOutlinedIcon }],
};

/** Status → pill label + colour tokens (dot, text, background). */
const STATUS_PILL = {
  open: { label: "Active", dot: "#1f9d57", text: "#13402d", bg: "#e7f1ea" },
  draft: { label: "Draft", dot: "#c9a23f", text: "#7a611a", bg: "#faf3e0" },
  closed: { label: "Closed", dot: "#9aa39e", text: "#5d635f", bg: "#eef0ef" },
};

/** Salary range, e.g. "AED 2,500–5,000". Returns null when no figures exist. */
const formatSalary = (min, max, currency) => {
  const cur = currency || "";
  const n = (v) => Number(v).toLocaleString();
  if (min != null && max != null) return `${cur} ${n(min)}–${n(max)}`.trim();
  if (min != null) return `${cur} ${n(min)}+`.trim();
  if (max != null) return `${cur} ${n(max)}`.trim();
  return null;
};

const MAX_SKILLS = 4;

/** A single job tile. Clicking the body opens the pipeline. */
const JobCard = ({ job }) => {
  const router = useRouter();
  const goToPipeline = () => router.push(`/jobs/${job.id}/pipeline`);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const updateStatus = useUpdateJobStatus(job.id);
  const actions = STATUS_ACTIONS[job.status] ?? [];
  const pill = STATUS_PILL[job.status] ?? STATUS_PILL.closed;

  const openMenu = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = (e) => {
    e?.stopPropagation();
    setMenuAnchor(null);
  };
  const applyStatus = (e, status) => {
    e.stopPropagation();
    setMenuAnchor(null);
    updateStatus.mutate(status);
  };

  const salary = formatSalary(job.min_salary, job.max_salary, job.currency);
  const skills = job.required_skills ?? [];
  const extraSkills = Math.max(0, skills.length - MAX_SKILLS);

  // Pipeline tallies from the list payload's per-stage breakdown. "Applied" is
  // everyone in the pipeline; "Shortlisted" is the final-shortlist (done) stage.
  const byStage = job.applications_by_stage ?? {};
  const applied = Object.values(byStage).reduce((sum, n) => sum + (n ?? 0), 0);
  const shortlisted = byStage.done ?? 0;

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        borderRadius: 4,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderColor: "#e7eae8",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "transparent",
          boxShadow: "0 12px 28px -10px rgba(19,64,45,.35)",
        },
      }}
    >
      {actions.length > 0 && (
        <>
          <Tooltip title="More actions">
            <IconButton
              size="small"
              aria-label="Job actions"
              onClick={openMenu}
              disabled={updateStatus.isPending}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                color: "text.secondary",
                opacity: 0,
                transition: "opacity .2s ease",
                ".MuiCard-root:hover &": { opacity: 1 },
                "&:focus-visible": { opacity: 1 },
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {updateStatus.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MoreVertIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {actions.map((a) => (
              <MenuItem key={a.status} onClick={(e) => applyStatus(e, a.status)}>
                <ListItemIcon>
                  <a.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{a.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      <CardActionArea
        onClick={goToPipeline}
        sx={{
          flexGrow: 1,
          alignItems: "stretch",
          "& .MuiCardActionArea-focusHighlight": { opacity: 0 },
        }}
      >
        <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header: title + company, status pill */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                title={job.title}
                sx={{ fontWeight: 800, color: "#13402d", lineHeight: 1.2 }}
              >
                {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                {job.hiring_company}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                flexShrink: 0,
                alignItems: "center",
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                bgcolor: pill.bg,
              }}
            >
              <CircleIcon sx={{ fontSize: 9, color: pill.dot }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: pill.text }}>
                {pill.label}
              </Typography>
            </Stack>
          </Stack>

          {/* Key facts */}
          <Stack spacing={1.25} sx={{ mt: 2.5 }}>
            <Row icon={PlaceOutlinedIcon} text={`${job.city}, ${countryLabel(job.country)}`} />
            <Row icon={WorkOutlineOutlinedIcon} text={humanize(job.work_mode)} />
            {salary && <Row icon={AttachMoneyIcon} text={salary} />}
          </Stack>

          {/* Skills */}
          {skills.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: "wrap", gap: 1 }}>
              {skills.slice(0, MAX_SKILLS).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: "#efe8d3",
                    color: "#5b4f2c",
                    fontWeight: 600,
                    borderRadius: 1.5,
                    "& .MuiChip-label": { px: 1.25 },
                  }}
                />
              ))}
              {extraSkills > 0 && (
                <Chip
                  label={`+${extraSkills}`}
                  size="small"
                  sx={{
                    bgcolor: "#efe8d3",
                    color: "#5b4f2c",
                    fontWeight: 600,
                    borderRadius: 1.5,
                    "& .MuiChip-label": { px: 1.25 },
                  }}
                />
              )}
            </Stack>
          )}

          {/* Footer: pipeline tallies + age */}
          <Box sx={{ mt: "auto", pt: 2.5 }}>
            <Divider sx={{ borderColor: "#edf0ee" }} />
            <Stack
              direction="row"
              sx={{ mt: 2, alignItems: "baseline", justifyContent: "space-between" }}
            >
              <Stat value={applied} label="Applied" />
              <Stat value={shortlisted} label="Shortlisted" />
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 1.5 }}
            >
              {timeAgo(job.created_at)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Row = ({ icon: Icon, text }) => (
  <Stack direction="row" spacing={1.25} sx={{ color: "text.secondary", alignItems: "center" }}>
    <Icon sx={{ fontSize: 20, color: "#7d8a82" }} />
    <Typography variant="body1" noWrap title={text} sx={{ color: "#4a5650" }}>
      {text}
    </Typography>
  </Stack>
);

const Stat = ({ value, label }) => (
  <Typography variant="body1" color="text.secondary">
    <Box component="span" sx={{ fontWeight: 800, color: "#13402d", mr: 0.75 }}>
      {value}
    </Box>
    {label}
  </Typography>
);

/** Loading placeholder that mirrors the JobCard layout. */
export const JobCardSkeleton = () => (
  <Card variant="outlined" sx={{ borderRadius: 4, height: "100%", borderColor: "#e7eae8" }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="70%" height={30} />
          <Skeleton variant="text" width="45%" />
        </Box>
        <Skeleton variant="rounded" width={66} height={24} sx={{ borderRadius: 999 }} />
      </Stack>

      <Stack spacing={1.5} sx={{ mt: 2.5 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="50%" />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
        <Skeleton variant="rounded" width={48} height={24} sx={{ borderRadius: 1.5 }} />
        <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 1.5 }} />
      </Stack>

      <Divider sx={{ mt: 3, borderColor: "#edf0ee" }} />
      <Stack direction="row" sx={{ mt: 2, justifyContent: "space-between" }}>
        <Skeleton variant="text" width={72} />
        <Skeleton variant="text" width={96} />
      </Stack>
      <Skeleton variant="text" width={90} sx={{ mx: "auto", mt: 1 }} />
    </CardContent>
  </Card>
);

export default JobCard;
