"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircleIcon from "@mui/icons-material/Circle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { humanize, jobStatusColor } from "@/lib/kabil/constants";
import { countryLabel } from "@/lib/kabil/jobOptions";
import { useUpdateJobStatus } from "@/lib/kabil/queries";

/** Status transitions surfaced in the 3-dots menu, keyed by current status. */
const STATUS_ACTIONS = {
  draft: [{ label: "Move to Active", status: "open", icon: PlayArrowOutlinedIcon }],
  open: [{ label: "Close job", status: "closed", icon: ArchiveOutlinedIcon }],
  closed: [{ label: "Reopen job", status: "open", icon: ReplayOutlinedIcon }],
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/** A single job tile. Clicking the body opens the pipeline; "View job" opens
 *  the full detail page. */
const JobCard = ({ job }) => {
  const router = useRouter();
  const goToPipeline = () => router.push(`/jobs/${job.id}/pipeline`);
  const goToDetail = (e) => {
    e.stopPropagation();
    router.push(`/jobs/${job.id}`);
  };

  const [menuAnchor, setMenuAnchor] = useState(null);
  const updateStatus = useUpdateJobStatus(job.id);
  const actions = STATUS_ACTIONS[job.status] ?? [];

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

  const ready = job.ready_for_applications;

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        borderRadius: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderColor: "#e7eae8",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        // Accent bar along the top edge, revealed on hover.
        "&::before": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 3,
          background: "linear-gradient(90deg, #13402d 0%, #c9a23f 100%)",
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
                top: 6,
                right: 6,
                zIndex: 2,
                color: "text.secondary",
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
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1}
            sx={{ pr: 3.5 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap title={job.title}>
                {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {job.hiring_company}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={humanize(job.status)}
              color={jobStatusColor(job.status)}
              variant={job.status === "draft" ? "outlined" : "filled"}
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          </Stack>

          <Stack spacing={1} mt={2}>
            <Row icon={PlaceOutlinedIcon} text={`${job.city}, ${countryLabel(job.country)}`} />
            <Row icon={WorkOutlineOutlinedIcon} text={humanize(job.employment_type)} />
            <Row icon={HomeWorkOutlinedIcon} text={humanize(job.work_mode)} />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}
          >
            <Tooltip
              title={
                ready
                  ? "Pipeline ready — accepting applications"
                  : "Setup pipeline is still running"
              }
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CircleIcon
                  sx={{ fontSize: 10, color: ready ? "success.main" : "warning.main" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {ready ? "Ready" : "Preparing…"}
                </Typography>
              </Stack>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {formatDate(job.created_at)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon />}
          onClick={goToDetail}
        >
          View job
        </Button>
        <Button
          size="small"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={goToPipeline}
          sx={{ ml: "auto" }}
        >
          Pipeline
        </Button>
      </CardActions>
    </Card>
  );
};

const Row = ({ icon: Icon, text }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
    <Icon sx={{ fontSize: 18 }} />
    <Typography variant="body2" noWrap title={text}>
      {text}
    </Typography>
  </Stack>
);

/** Loading placeholder that mirrors the JobCard layout. */
export const JobCardSkeleton = () => (
  <Card variant="outlined" sx={{ borderRadius: 2.5, height: "100%", borderColor: "#e7eae8" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="75%" height={26} />
          <Skeleton variant="text" width="50%" />
        </Box>
        <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 999 }} />
      </Stack>

      <Stack spacing={1.25} mt={2}>
        <Skeleton variant="text" width="65%" />
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="text" width="50%" />
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}
      >
        <Skeleton variant="text" width={64} />
        <Skeleton variant="text" width={72} />
      </Stack>
    </CardContent>
    <CardActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
      <Skeleton variant="rounded" width={104} height={32} />
      <Skeleton variant="rounded" width={104} height={32} sx={{ ml: "auto" }} />
    </CardActions>
  </Card>
);

export default JobCard;
