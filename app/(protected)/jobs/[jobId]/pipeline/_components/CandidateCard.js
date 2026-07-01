"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CircleIcon from "@mui/icons-material/Circle";
import { humanize, statusColor, scoreBand, toScore, timeAgo } from "@/lib/kabil/constants";

const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** Best score available for the candidate at their current stage. */
const bestScore = (app) => {
  const hard = toScore(app.hard_filter_score);
  return hard != null ? hard : toScore(app.similarity_score);
};

/** Solid + soft tint per MUI palette tone, for inline chip/badge styling. */
const TONE = {
  success: { solid: "#0F6E56", soft: "rgba(15,110,86,0.12)" },
  warning: { solid: "#b78a1f", soft: "rgba(239,159,39,0.16)" },
  error: { solid: "#d14343", soft: "rgba(209,67,67,0.12)" },
  info: { solid: "#2f7fd1", soft: "rgba(47,127,209,0.12)" },
  default: { solid: "#5f6b66", soft: "rgba(0,0,0,0.06)" },
};
const tone = (key) => TONE[key] ?? TONE.default;

/** Soft-filled tag with an optional leading icon (e.g. the AI band chip). */
const SoftChip = ({ icon, label, toneKey }) => {
  const t = tone(toneKey);
  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      sx={{
        height: 24,
        fontWeight: 600,
        borderRadius: 1.5,
        bgcolor: t.soft,
        color: t.solid,
        "& .MuiChip-label": { px: 0.75 },
        "& .MuiChip-icon": { color: t.solid, fontSize: 14, ml: 0.75, mr: -0.25 },
      }}
    />
  );
};

/** Outlined tag with a leading status dot (e.g. "● Review"). */
const DotChip = ({ label, toneKey }) => {
  const t = tone(toneKey);
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<CircleIcon sx={{ fontSize: "9px !important", color: `${t.solid} !important` }} />}
      label={label}
      sx={{
        height: 24,
        fontWeight: 600,
        borderRadius: 1.5,
        bgcolor: "#fff",
        color: "#4a5650",
        borderColor: "#e7eae8",
        "& .MuiChip-label": { px: 0.75 },
        "& .MuiChip-icon": { ml: 0.75, mr: -0.25 },
      }}
    />
  );
};

/**
 * A compact applicant tile for the pipeline board. Click (or the ⋯ button)
 * opens the detail drawer; when `draggable` it can be dragged to an adjacent
 * stage column.
 */
const CandidateCard = ({ app, jobTitle, onOpen, draggable = false, onDragStart, onDragEnd, dragging = false }) => {
  const score = bestScore(app);
  const band = scoreBand(score);
  const accent = tone(band.color);

  return (
    <Card
      variant="outlined"
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart?.(e, app) : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      sx={{
        borderRadius: 2.5,
        borderColor: "#e7eae8",
        cursor: draggable ? "grab" : "default",
        opacity: dragging ? 0.4 : 1,
        "&:active": draggable ? { cursor: "grabbing" } : undefined,
        transition: "box-shadow .15s ease, border-color .15s ease, transform .15s ease, opacity .15s ease",
        "&:hover": {
          borderColor: "transparent",
          boxShadow: "0 8px 20px -10px rgba(15,110,86,.35)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* component="div" keeps the ⋯ IconButton from nesting a button in a button */}
      <CardActionArea component="div" onClick={() => onOpen(app.id)} sx={{ p: 1.75 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
            {initials(app.candidate_full_name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="body2"
              noWrap
              title={app.candidate_full_name}
              sx={{ fontWeight: 700, color: "#1c2522" }}
            >
              {app.candidate_full_name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {jobTitle}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Candidate actions"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(app.id);
            }}
            sx={{ mt: -0.75, mr: -0.75, color: "text.disabled" }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Stack>

        {score != null && (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, score))}
              sx={{
                flexGrow: 1,
                height: 5,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": { bgcolor: accent.solid, borderRadius: 3 },
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: accent.solid, minWidth: 22, textAlign: "right" }}
            >
              {Math.round(score)}
            </Typography>
          </Stack>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5, alignItems: "center" }}>
          <SoftChip icon={<AutoAwesomeIcon />} label={`AI: ${band.label}`} toneKey={band.color} />
          {app.status !== "active" && (
            <DotChip label={humanize(app.status)} toneKey={statusColor(app.status)} />
          )}
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 1.5, color: "text.secondary" }}>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">{timeAgo(app.created_at)}</Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default CandidateCard;
