"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
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
  success: { solid: "#1f9d57", soft: "rgba(31,157,87,0.12)" },
  warning: { solid: "#b78a1f", soft: "rgba(201,162,63,0.18)" },
  error: { solid: "#d14343", soft: "rgba(209,67,67,0.12)" },
  info: { solid: "#2f7fd1", soft: "rgba(47,127,209,0.12)" },
  default: { solid: "#5f6b66", soft: "rgba(0,0,0,0.06)" },
};
const tone = (key) => TONE[key] ?? TONE.default;

const SoftChip = ({ label, toneKey }) => {
  const t = tone(toneKey);
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 22,
        fontWeight: 600,
        bgcolor: t.soft,
        color: t.solid,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
};

/**
 * A compact applicant tile for the pipeline board. Click opens the detail
 * drawer; when `draggable` it can be dragged to an adjacent stage column.
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
        borderRadius: 2,
        borderColor: "#e7eae8",
        cursor: draggable ? "grab" : "default",
        opacity: dragging ? 0.4 : 1,
        "&:active": draggable ? { cursor: "grabbing" } : undefined,
        transition: "box-shadow .15s ease, border-color .15s ease, transform .15s ease, opacity .15s ease",
        "&:hover": {
          borderColor: "transparent",
          boxShadow: "0 8px 20px -10px rgba(19,64,45,.35)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea onClick={() => onOpen(app.id)} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 13 }}>
            {initials(app.candidate_full_name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap title={app.candidate_full_name}>
              {app.candidate_full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {jobTitle}
            </Typography>
          </Box>
          {score != null && (
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{ color: accent.solid, lineHeight: 1.6 }}
            >
              {Math.round(score)}
            </Typography>
          )}
        </Stack>

        {score != null && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, score))}
            sx={{
              mt: 1.25,
              height: 4,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.05)",
              "& .MuiLinearProgress-bar": { bgcolor: accent.solid, borderRadius: 2 },
            }}
          />
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5, alignItems: "center" }}>
          <SoftChip label={`AI · ${band.label}`} toneKey={band.color} />
          {app.status !== "active" && (
            <SoftChip label={humanize(app.status)} toneKey={statusColor(app.status)} />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mt={1.25}>
          {timeAgo(app.created_at)}
        </Typography>
      </CardActionArea>
    </Card>
  );
};

export default CandidateCard;
